function SearchFilterBar({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onRefresh
}) {
  return (
    <section className="toolbar panel">
      <div className="toolbar-field">
        <label htmlFor="search">Search applications</label>
        <input
          id="search"
          placeholder="Search by application name"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="toolbar-field">
        <label htmlFor="category">Filter category</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Compute">Compute</option>
          <option value="Storage">Storage</option>
          <option value="AI">AI</option>
          <option value="DevOps">DevOps</option>
          <option value="Security">Security</option>
        </select>
      </div>

      <button className="button button-primary toolbar-button" onClick={onRefresh}>
        Refresh Data
      </button>
    </section>
  );
}

export default SearchFilterBar;
