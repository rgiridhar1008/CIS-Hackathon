const initialState = {
  app_id: "",
  name: "",
  version: "",
  category: "Compute",
  usage_count: 0,
  dependencies: "",
  status: "active"
};

function ApplicationForm({
  formData,
  onChange,
  onSubmit,
  onReset,
  isEditing,
  submitting
}) {
  const data = formData || initialState;

  return (
    <section className="panel panel-highlight">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Application Manager</p>
          <h2>{isEditing ? "Edit application" : "Add a new application"}</h2>
        </div>
      </div>

      <form className="app-form" onSubmit={onSubmit}>
        <label>
          <span>Name</span>
          <input
            name="name"
            placeholder="e.g. AWS Lambda"
            value={data.name}
            onChange={onChange}
            required
          />
        </label>

        <label>
          <span>Version</span>
          <input
            name="version"
            placeholder="e.g. 2.3.0"
            value={data.version}
            onChange={onChange}
            required
          />
        </label>

        <label>
          <span>Category</span>
          <select name="category" value={data.category} onChange={onChange}>
            <option value="Compute">Compute</option>
            <option value="Storage">Storage</option>
            <option value="AI">AI</option>
            <option value="DevOps">DevOps</option>
            <option value="Security">Security</option>
          </select>
        </label>

        <label>
          <span>Usage Count</span>
          <input
            name="usage_count"
            type="number"
            min="0"
            value={data.usage_count}
            onChange={onChange}
          />
        </label>

        <label className="full-width">
          <span>Dependencies</span>
          <input
            name="dependencies"
            placeholder="Comma separated values"
            value={data.dependencies}
            onChange={onChange}
          />
        </label>

        <label>
          <span>Status</span>
          <select name="status" value={data.status} onChange={onChange}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </label>

        <div className="form-actions full-width">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEditing ? "Update Application" : "Add Application"}
          </button>
          <button className="button button-secondary" type="button" onClick={onReset}>
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default ApplicationForm;
