import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import ApplicationForm from "../components/ApplicationForm.jsx";
import ApplicationList from "../components/ApplicationList.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import RecommendationPanel from "../components/RecommendationPanel.jsx";
import SearchFilterBar from "../components/SearchFilterBar.jsx";
import Toast from "../components/Toast.jsx";

const AnalyticsPanel = lazy(() => import("../components/AnalyticsPanel.jsx"));

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4001";

const emptyForm = {
  app_id: "",
  name: "",
  version: "",
  category: "Compute",
  usage_count: 0,
  dependencies: "",
  status: "active"
};

const mapFormFromApplication = (application) => ({
  app_id: application.app_id,
  name: application.name,
  version: application.version,
  category: application.category,
  usage_count: application.usage_count,
  dependencies: (application.dependencies || []).join(", "),
  status: application.status || "active"
});

const normalizeCollectionPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedAppName, setSelectedAppName] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const isEditing = Boolean(formData.app_id);

  const fetchJson = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Request failed");
    }

    return payload;
  };

  const loadApplications = async () => {
    const path =
      searchTerm.trim().length > 0
        ? `/search?name=${encodeURIComponent(searchTerm.trim())}`
        : selectedCategory !== "All"
          ? `/filter?category=${encodeURIComponent(selectedCategory)}`
          : "/getApps";

    const payload = await fetchJson(path);
    const applicationData = normalizeCollectionPayload(payload);
    const filteredData =
      selectedCategory !== "All"
        ? applicationData.filter((app) => app.category === selectedCategory)
        : applicationData;

    setApplications(filteredData);
  };

  const loadAnalytics = async () => {
    const payload = await fetchJson("/analytics");
    setAnalytics(payload.data || payload);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([loadApplications(), loadAnalytics()]);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadApplications().catch((error) =>
        setToast({ type: "error", message: error.message })
      );
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  const overviewCards = useMemo(() => {
    const activeCount = applications.filter((app) => app.status !== "pending").length;
    const pendingCount = applications.filter((app) => app.status === "pending").length;

    return [
      {
        label: "Active Apps",
        value: activeCount,
        accent: "green"
      },
      {
        label: "Pending Apps",
        value: pendingCount,
        accent: "yellow"
      },
      {
        label: "Visible Results",
        value: applications.length,
        accent: "blue"
      }
    ];
  }, [applications]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "usage_count" ? Number(value) : value
    }));
  };

  const handleReset = () => {
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        dependencies: formData.dependencies
      };

      await fetchJson(isEditing ? "/updateApp" : "/addApp", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      setToast({
        type: "success",
        message: isEditing ? "Application updated" : "Application added"
      });
      handleReset();
      await Promise.all([loadApplications(), loadAnalytics()]);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (application) => {
    setFormData(mapFormFromApplication(application));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (appId) => {
    try {
      await fetchJson("/deleteApp", {
        method: "DELETE",
        body: JSON.stringify({ app_id: appId })
      });
      setToast({ type: "success", message: "Application deleted" });
      if (formData.app_id === appId) {
        handleReset();
      }
      await Promise.all([loadApplications(), loadAnalytics()]);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const handleRecommend = async (appId) => {
    try {
      const payload = await fetchJson(`/recommend?app_id=${encodeURIComponent(appId)}`);
      let recommendationData = normalizeCollectionPayload(payload);

      if (!recommendationData.length) {
        recommendationData = applications
          .filter((app) => app.app_id !== appId)
          .sort((a, b) => Number(b.usage_count || 0) - Number(a.usage_count || 0))
          .slice(0, 3);
      }

      const selectedApp =
        applications.find((app) => app.app_id === appId) || payload.based_on || null;

      setRecommendations(recommendationData);
      setSelectedAppName(selectedApp?.name || "");
      setToast({ type: "success", message: "Recommendations loaded" });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="hero">
        <div>
          <p className="eyebrow">Intelligent Cloud Application Catalog System</p>
          <h1>Manage, discover, and analyze cloud apps from one dashboard.</h1>
          <p className="hero-copy">
            Built for hackathons but structured for deployment, with DynamoDB-backed
            APIs, smart recommendations, and live analytics panels.
          </p>
        </div>

        <div className="overview-grid">
          {overviewCards.map((card) => (
            <article className={`overview-card ${card.accent}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="primary-column">
          <ApplicationForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isEditing={isEditing}
            submitting={submitting}
          />

          <SearchFilterBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onRefresh={loadDashboard}
          />

          <ApplicationList
            applications={applications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRecommend={handleRecommend}
          />
        </div>

        <div className="secondary-column">
          <RecommendationPanel
            selectedAppName={selectedAppName}
            recommendations={recommendations}
          />
          <Suspense fallback={<section className="panel">Loading analytics...</section>}>
            <AnalyticsPanel analytics={analytics} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
