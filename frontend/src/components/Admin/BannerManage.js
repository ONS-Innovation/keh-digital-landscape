import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import MultiSelect from "../MultiSelect/MultiSelect";
import {
  fetchExistingBanners,
  saveBanner,
  toggleBanner,
  deleteBanner
} from "../../utilities/adminBanner";

const BannerManage = () => {
  // Banner management state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState("info");
  const [selectedPages, setSelectedPages] = useState([]);
  const [existingBanners, setExistingBanners] = useState([]);
  const [showBannerConfirmModal, setShowBannerConfirmModal] = useState(false);
  const [bannerSaveStatus, setBannerSaveStatus] = useState(null);

  // Page options for banners
  const pageOptions = [
    { label: "Radar", value: "radar" },
    { label: "Statistics", value: "statistics" },
    { label: "Projects", value: "projects" },
  ];

  useEffect(() => {
    loadExistingBanners();
  }, []);

  /**
   * Fetches existing banners from the backend
   */
  const loadExistingBanners = async () => {
    try {
      const banners = await fetchExistingBanners();
      setExistingBanners(banners);
    } catch (error) {
      console.error("Error fetching existing banners:", error);
      toast.error("Failed to load existing banners");
    }
  };

  /**
   * Handles saving a banner
   */
  const handleSaveBanner = () => {
    setShowBannerConfirmModal(true);
  };

  /**
   * Confirms saving a banner to the backend
   */
  const handleSaveBannerConfirm = async () => {
    try {
      const bannerData = {
        message: bannerMessage,
        title: bannerTitle,
        type: bannerType,
        pages: selectedPages.map((page) => page.value),
        show: true,
      };

      await saveBanner(bannerData);
      
      setBannerSaveStatus("success");
      toast.success("Banner saved successfully!");

      // Clear form after successful save
      setTimeout(() => {
        setBannerMessage("");
        setBannerTitle("");
        setBannerType("info");
        setSelectedPages([]);
        setShowBannerConfirmModal(false);
        setBannerSaveStatus(null);
        loadExistingBanners(); // Refresh the list of banners
      }, 2000);
    } catch (error) {
      console.error("Error saving banner:", error);
      setBannerSaveStatus("error");
      toast.error("Failed to save banner. Please try again.");
      setShowBannerConfirmModal(false);
    }
  };

  /**
   * Cancels the banner save confirmation
   */
  const handleSaveBannerCancel = () => {
    setShowBannerConfirmModal(false);
  };

  /**
   * Toggles a banner's visibility
   */
  const handleToggleBanner = async (index, shouldShow) => {
    try {
      await toggleBanner(index, shouldShow);

      // Update local state
      const updatedBanners = [...existingBanners];
      updatedBanners[index] = {
        ...updatedBanners[index],
        show: shouldShow,
      };
      setExistingBanners(updatedBanners);

      toast.success(`Banner ${shouldShow ? "shown" : "hidden"} successfully`);
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner visibility");
    }
  };

  /**
   * Deletes a banner
   */
  const handleDeleteBanner = async (index) => {
    try {
      await deleteBanner(index);

      // Update local state
      const updatedBanners = existingBanners.filter((_, i) => i !== index);
      setExistingBanners(updatedBanners);

      toast.success("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="admin-container">
      <div className="banner-management-modal">
        <div className="admin-modal-inputs">
          <div className="admin-modal-field">
            <label>Title</label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="Enter banner title"
              className="technology-input"
              aria-label="Enter Banner Title"
            />
          </div>

          <div className="admin-modal-field">
            <label>Message</label>
            <textarea
              value={bannerMessage}
              onChange={(e) => setBannerMessage(e.target.value)}
              placeholder="Enter banner message"
              className="technology-input"
              rows={4}
              aria-label="Enter Banner Message"
            />
          </div>

          <div className="admin-modal-field">
            <label>Type</label>
            <div className="banner-type-selector">
              <div
                className={`banner-type-option ${bannerType === "info" ? "selected" : ""}`}
                onClick={() => setBannerType("info")}
              >
                <span className="banner-type-indicator info"></span>
                Info
              </div>
              <div
                className={`banner-type-option ${bannerType === "warning" ? "selected" : ""}`}
                onClick={() => setBannerType("warning")}
              >
                <span className="banner-type-indicator warning"></span>
                Warning
              </div>
              <div
                className={`banner-type-option ${bannerType === "error" ? "selected" : ""}`}
                onClick={() => setBannerType("error")}
              >
                <span className="banner-type-indicator error"></span>
                Error
              </div>
            </div>
          </div>

          <div className="admin-modal-field">
            <label>Display on Pages</label>
            <div className="admin-buttons">
              <MultiSelect
                options={pageOptions}
                value={selectedPages}
                onChange={setSelectedPages}
                placeholder="Select pages..."
              />
              <button
                className="admin-button"
                onClick={handleSaveBanner}
                disabled={
                  !bannerMessage.trim() ||
                  !bannerTitle.trim() ||
                  selectedPages.length === 0
                }
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>

        {/* Existing Banners */}
        <div className="admin-modal-field">
          <h1 className="existing-banners-title">Existing Banners</h1>
          {existingBanners.length === 0 ? (
            <p>No banners have been created yet.</p>
          ) : (
            <div className="existing-banners">
              {existingBanners.map((banner, index) => (
                <div className="banner-item" key={index}>
                  <div className="banner-content">
                    <h2>{banner.title || banner.message}</h2>
                    <p>{banner.message}</p>
                    <div className="banner-actions">
                      <div className="banner-meta">
                        <span
                          className={`banner-type ${banner.type || "info"}`}
                        >
                          {banner.type || "info"}
                        </span>
                        <span className="banner-pages">
                          Pages:{" "}
                          {Array.isArray(banner.pages)
                            ? banner.pages.join(", ")
                            : banner.page || "none"}
                        </span>
                        <span
                          className={`banner-status ${banner.show ? "active" : "hidden"}`}
                        >
                          {banner.show ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <div className="banner-actions">
                        <button
                          className="banner-toggle-btn"
                          onClick={() =>
                            handleToggleBanner(index, !banner.show)
                          }
                          title={banner.show ? "Hide" : "Show"}
                          aria-label={banner.show ? "Hide" : "Show"}
                        >
                          {banner.show ? "Hide" : "Show"}
                        </button>
                        <button
                          className="banner-delete-btn"
                          onClick={() => handleDeleteBanner(index)}
                          title="Delete banner"
                          aria-label="Delete banner"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showBannerConfirmModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h1>Confirm Banner Changes</h1>
            <p>Are you sure you want to save these changes?</p>
            <div className="modal-buttons">
              <button onClick={handleSaveBannerConfirm}>Yes</button>
              <button onClick={handleSaveBannerCancel}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManage;
