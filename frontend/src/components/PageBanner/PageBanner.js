import '../../styles/components/PageBanner.css';
import BannerTabs from './BannerTabs';

function PageBanner({ title, description, tabs, activeTab, onTabChange }) {
  return (
    <div className="banner-details">
      <div className="banner-header-left">
        <div className="banner-review-title">
          <h1>{title}</h1>
          <span>{description}</span>
        </div>
      </div>
      <BannerTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

export default PageBanner;
