import '../../styles/components/PageBanner.css';

function BannerTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="banner-tabs">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`banner-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

export default BannerTabs;
