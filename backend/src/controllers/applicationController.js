import { v4 as uuidv4 } from "uuid";
import {
  getAllApplications,
  getApplicationById,
  removeApplication,
  saveApplication
} from "../db.js";

const normalizeDependencies = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeStatus = (status) => {
  const normalized = String(status || "active").toLowerCase();
  return normalized === "pending" ? "pending" : "active";
};

const getRecommendationScore = (selected, candidate) => {
  let score = 0;

  if (candidate.category?.toLowerCase() === selected.category?.toLowerCase()) {
    score += 100;
  }

  const selectedDependencies = new Set(
    (selected.dependencies || []).map((dependency) => String(dependency).toLowerCase())
  );
  const sharedDependencies = (candidate.dependencies || []).filter((dependency) =>
    selectedDependencies.has(String(dependency).toLowerCase())
  ).length;

  score += sharedDependencies * 25;
  score += Number(candidate.usage_count || 0) / 10;

  return score;
};

const validateApplicationPayload = (payload, isUpdate = false) => {
  const requiredFields = ["name", "version", "category"];
  const missingFields = requiredFields.filter(
    (field) => !isUpdate && !String(payload[field] || "").trim()
  );

  if (missingFields.length) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  if (
    payload.usage_count !== undefined &&
    (Number.isNaN(Number(payload.usage_count)) || Number(payload.usage_count) < 0)
  ) {
    return "usage_count must be a non-negative number";
  }

  return null;
};

export const fetchApplications = async (_req, res, next) => {
  try {
    const applications = await getAllApplications();
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

export const addApplication = async (req, res, next) => {
  try {
    const validationError = validateApplicationPayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const application = {
      app_id: req.body.app_id || uuidv4(),
      name: String(req.body.name).trim(),
      version: String(req.body.version).trim(),
      category: String(req.body.category).trim(),
      usage_count: Number(req.body.usage_count || 0),
      dependencies: normalizeDependencies(req.body.dependencies),
      created_at: req.body.created_at || new Date().toISOString(),
      status: normalizeStatus(req.body.status)
    };

    await saveApplication(application);

    return res.status(201).json({
      success: true,
      message: "Application added successfully",
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const appId = req.body.app_id;
    if (!appId) {
      return res
        .status(400)
        .json({ success: false, message: "app_id is required for updates" });
    }

    const existing = await getApplicationById(appId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const validationError = validateApplicationPayload(
      { ...existing, ...req.body },
      true
    );
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const updatedApplication = {
      ...existing,
      ...req.body,
      name: req.body.name !== undefined ? String(req.body.name).trim() : existing.name,
      version:
        req.body.version !== undefined ? String(req.body.version).trim() : existing.version,
      category:
        req.body.category !== undefined
          ? String(req.body.category).trim()
          : existing.category,
      usage_count:
        req.body.usage_count !== undefined
          ? Number(req.body.usage_count)
          : existing.usage_count,
      dependencies:
        req.body.dependencies !== undefined
          ? normalizeDependencies(req.body.dependencies)
          : existing.dependencies,
      status:
        req.body.status !== undefined ? normalizeStatus(req.body.status) : existing.status
    };

    await saveApplication(updatedApplication);

    return res.json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const appId = req.body.app_id || req.query.app_id;
    if (!appId) {
      return res
        .status(400)
        .json({ success: false, message: "app_id is required for deletion" });
    }

    const existing = await removeApplication(appId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    return res.json({
      success: true,
      message: "Application deleted successfully",
      data: existing
    });
  } catch (error) {
    next(error);
  }
};

export const searchApplications = async (req, res, next) => {
  try {
    const name = String(req.query.name || "").trim().toLowerCase();
    const applications = await getAllApplications();
    const data = name
      ? applications.filter((app) => app.name.toLowerCase().includes(name))
      : applications;

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const filterApplications = async (req, res, next) => {
  try {
    const category = String(req.query.category || "").trim().toLowerCase();
    const applications = await getAllApplications();
    const data = category
      ? applications.filter((app) => app.category.toLowerCase() === category)
      : applications;

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const recommendApplications = async (req, res, next) => {
  try {
    const appId = String(req.query.app_id || "").trim();
    if (!appId) {
      return res
        .status(400)
        .json({ success: false, message: "app_id query parameter is required" });
    }

    const applications = await getAllApplications();
    const selected = applications.find((app) => app.app_id === appId);

    if (!selected) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const data = applications
      .filter((app) => app.app_id !== selected.app_id)
      .map((app) => ({
        ...app,
        recommendationScore: getRecommendationScore(selected, app)
      }))
      .sort((a, b) => {
        if (b.recommendationScore !== a.recommendationScore) {
          return b.recommendationScore - a.recommendationScore;
        }

        return Number(b.usage_count || 0) - Number(a.usage_count || 0);
      })
      .slice(0, 3)
      .map(({ recommendationScore, ...app }) => app);

    res.json({
      success: true,
      based_on: selected,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req, res, next) => {
  try {
    const applications = await getAllApplications();
    const mostUsedApps = [...applications]
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);

    const categoryDistribution = applications.reduce((accumulator, app) => {
      accumulator[app.category] = (accumulator[app.category] || 0) + 1;
      return accumulator;
    }, {});

    const statusBreakdown = applications.reduce((accumulator, app) => {
      const key = app.status || "active";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    res.json({
      success: true,
      data: {
        total_apps: applications.length,
        total_usage: applications.reduce((sum, app) => sum + Number(app.usage_count || 0), 0),
        most_used_apps: mostUsedApps,
        category_distribution: Object.entries(categoryDistribution).map(
          ([name, value]) => ({
            name,
            value
          })
        ),
        status_breakdown: Object.entries(statusBreakdown).map(([name, value]) => ({
          name,
          value
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
