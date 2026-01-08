import { useState, useEffect } from "react";
import { getRequest, putRequest } from "../../lib/apiService";
import { notify } from "../../lib/toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    // Basic info
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    
    // Solar profile
    installation_status: "",
    property_type: "",
    avg_monthly_bill: "",
    roof_area_sqft: "",
    connection_type: "",
    subsidy_interest: false,
    plant_capacity_kw: "",
    net_metering: false,
    inverter_brand: "",
    discom_name: "",
    consumer_number: "",
    subsidy_applied: false,
    subsidy_status: "",
    scheme_name: "",
    application_id: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getRequest("/user/profile");
      setUser(response.data.user);
      
      // Initialize form data
      const u = response.data.user;
      setFormData({
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",
        phone: u.phone || "",
        address_line1: u.address_line1 || "",
        address_line2: u.address_line2 || "",
        city: u.city || "",
        state: u.state || "",
        pincode: u.pincode || "",
        installation_status: u.installation_status || "NOT_INSTALLED",
        property_type: u.property_type || "",
        avg_monthly_bill: u.avg_monthly_bill || "",
        roof_area_sqft: u.roof_area_sqft || "",
        connection_type: u.connection_type || "SINGLE_PHASE",
        subsidy_interest: u.subsidy_interest || false,
        plant_capacity_kw: u.plant_capacity_kw || "",
        net_metering: u.net_metering || false,
        inverter_brand: u.inverter_brand || "",
        discom_name: u.discom_name || "",
        consumer_number: u.consumer_number || "",
        subsidy_applied: u.subsidy_applied || false,
        subsidy_status: u.subsidy_status || "",
        scheme_name: u.scheme_name || "",
        application_id: u.application_id || "",
      });
    } catch {
      notify.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await putRequest("/user/profile", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });
      notify.success("Profile updated successfully");
      setEditMode(false);
      fetchProfile();
    } catch {
      notify.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSolarProfile = async () => {
    try {
      setSaving(true);
      await putRequest("/user/solar-profile", {
        installation_status: formData.installation_status,
        property_type: formData.property_type,
        avg_monthly_bill: parseFloat(formData.avg_monthly_bill) || 0,
        roof_area_sqft: parseFloat(formData.roof_area_sqft) || 0,
        connection_type: formData.connection_type,
        subsidy_interest: formData.subsidy_interest,
        plant_capacity_kw: parseFloat(formData.plant_capacity_kw) || 0,
        net_metering: formData.net_metering,
        inverter_brand: formData.inverter_brand,
        discom_name: formData.discom_name,
        consumer_number: formData.consumer_number,
        subsidy_applied: formData.subsidy_applied,
        subsidy_status: formData.subsidy_status,
        scheme_name: formData.scheme_name,
        application_id: formData.application_id,
      });
      notify.success("Solar profile updated successfully");
      fetchProfile();
    } catch {
      notify.error("Failed to update solar profile");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      NOT_INSTALLED: "bg-gray-100 text-gray-800",
      INSTALLATION_PLANNED: "bg-yellow-100 text-yellow-800",
      INSTALLED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      DISBURSED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-solar-yellow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-solar-primary dark:text-solar-yellow mb-6">
          My Profile
        </h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-solar-yellow text-solar-dark"
                : "bg-solar-dark/50 dark:bg-solar-night/50 text-solar-primary hover:bg-solar-dark/80"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("solar")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "solar"
                ? "bg-solar-yellow text-solar-dark"
                : "bg-solar-dark/50 dark:bg-solar-night/50 text-solar-primary hover:bg-solar-dark/80"
            }`}
          >
            Solar Details
          </button>
          <button
            onClick={() => setActiveTab("subsidy")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "subsidy"
                ? "bg-solar-yellow text-solar-dark"
                : "bg-solar-dark/50 dark:bg-solar-night/50 text-solar-primary hover:bg-solar-dark/80"
            }`}
          >
            Subsidy Status
          </button>
        </div>

        {/* Personal Info Tab */}
        {activeTab === "profile" && (
          <div className="bg-solar-dark/30 dark:bg-solar-night/30 rounded-xl p-6 shadow-lg border border-solar-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-solar-primary dark:text-solar-yellow">
                Personal Information
              </h2>
              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-solar-yellow text-solar-dark hover:bg-solar-orange"
                >
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile();
                    }}
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-solar-yellow text-solar-dark hover:bg-solar-orange"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-solar-muted">First Name</label>
                {editMode ? (
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="bg-solar-dark/50 dark:bg-solar-night/50"
                  />
                ) : (
                  <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                    {user?.first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-solar-muted">Last Name</label>
                {editMode ? (
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="bg-solar-dark/50 dark:bg-solar-night/50"
                  />
                ) : (
                  <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                    {user?.last_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-solar-muted">Email</label>
                <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-solar-muted">Phone</label>
                {editMode ? (
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-solar-dark/50 dark:bg-solar-night/50"
                  />
                ) : (
                  <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                    {user?.phone || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-solar-muted">Address</label>
                {editMode ? (
                  <div className="space-y-2">
                    <Input
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      placeholder="Address Line 1"
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                    <Input
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      placeholder="Address Line 2"
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="bg-solar-dark/50 dark:bg-solar-night/50"
                      />
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="bg-solar-dark/50 dark:bg-solar-night/50"
                      />
                      <Input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        className="bg-solar-dark/50 dark:bg-solar-night/50"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                    {[user?.address_line1, user?.address_line2, user?.city, user?.state, user?.pincode]
                      .filter(Boolean)
                      .join(", ") || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Solar Details Tab */}
        {activeTab === "solar" && (
          <div className="bg-solar-dark/30 dark:bg-solar-night/30 rounded-xl p-6 shadow-lg border border-solar-border">
            <h2 className="text-xl font-semibold text-solar-primary dark:text-solar-yellow mb-6">
              Solar Installation Details
            </h2>

            {/* Status Banner */}
            <div className={`p-4 rounded-lg mb-6 ${getStatusBadge(user?.installation_status)}`}>
              <span className="font-medium">
                Installation Status: {user?.installation_status?.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-solar-muted">Property Type</label>
                <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {user?.property_type || "Not specified"}
                </p>
              </div>

              {(user?.installation_status === "NOT_INSTALLED" || user?.installation_status === "INSTALLATION_PLANNED") && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Avg. Monthly Bill</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      ₹{user?.avg_monthly_bill || 0}/month
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Roof Area</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.roof_area_sqft || "Not specified"} sq ft
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Connection Type</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.connection_type?.replace("_", " ") || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Interested in Subsidy</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.subsidy_interest ? "Yes" : "No"}
                    </p>
                  </div>
                </>
              )}

              {user?.installation_status === "INSTALLED" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Plant Capacity</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.plant_capacity_kw || 0} kW
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Net Metering</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.net_metering ? "Enabled" : "Not Enabled"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Inverter Brand</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.inverter_brand || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">DISCOM</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.discom_name || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Consumer Number</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.consumer_number || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Device Linked</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.device_linked ? `Yes - ${user.device_id}` : "No device linked"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Update Solar Profile Section */}
            <div className="mt-8 pt-6 border-t border-solar-border">
              <h3 className="text-lg font-semibold text-solar-primary dark:text-solar-yellow mb-4">
                Update Solar Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-solar-muted">Installation Status</label>
                  <select
                    name="installation_status"
                    value={formData.installation_status}
                    onChange={handleChange}
                    className="w-full h-10 bg-solar-dark/50 dark:bg-solar-night/50 text-solar-primary border border-solar-border rounded-lg px-3"
                  >
                    <option value="NOT_INSTALLED">Not Installed (Planning)</option>
                    <option value="INSTALLATION_PLANNED">Installation Planned</option>
                    <option value="INSTALLED">Already Installed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-solar-muted">Property Type</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full h-10 bg-solar-dark/50 dark:bg-solar-night/50 text-solar-primary border border-solar-border rounded-lg px-3"
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>
              </div>

              {formData.installation_status !== "INSTALLED" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Avg Monthly Bill (₹)</label>
                    <Input
                      name="avg_monthly_bill"
                      type="number"
                      value={formData.avg_monthly_bill}
                      onChange={handleChange}
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Roof Area (sq ft)</label>
                    <Input
                      name="roof_area_sqft"
                      type="number"
                      value={formData.roof_area_sqft}
                      onChange={handleChange}
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Connection Type</label>
                    <select
                      name="connection_type"
                      value={formData.connection_type}
                      onChange={handleChange}
                      className="w-full h-10 bg-solar-dark/50 dark:bg-solar-night/50 text-solar-primary border border-solar-border rounded-lg px-3"
                    >
                      <option value="SINGLE_PHASE">Single Phase</option>
                      <option value="THREE_PHASE">Three Phase</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Plant Capacity (kW)</label>
                    <Input
                      name="plant_capacity_kw"
                      type="number"
                      value={formData.plant_capacity_kw}
                      onChange={handleChange}
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Inverter Brand</label>
                    <Input
                      name="inverter_brand"
                      value={formData.inverter_brand}
                      onChange={handleChange}
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">DISCOM Name</label>
                    <Input
                      name="discom_name"
                      value={formData.discom_name}
                      onChange={handleChange}
                      className="bg-solar-dark/50 dark:bg-solar-night/50"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveSolarProfile}
                disabled={saving}
                className="bg-solar-yellow text-solar-dark hover:bg-solar-orange"
              >
                {saving ? "Saving..." : "Update Solar Details"}
              </Button>
            </div>
          </div>
        )}

        {/* Subsidy Status Tab */}
        {activeTab === "subsidy" && (
          <div className="bg-solar-dark/30 dark:bg-solar-night/30 rounded-xl p-6 shadow-lg border border-solar-border">
            <h2 className="text-xl font-semibold text-solar-primary dark:text-solar-yellow mb-6">
              Subsidy Information
            </h2>

            {user?.subsidy_applied ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${getStatusBadge(user?.subsidy_status)}`}>
                  <p className="font-medium">Status: {user?.subsidy_status}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Scheme Name</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.scheme_name || "Not specified"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-solar-muted">Application ID</label>
                    <p className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                      {user?.application_id || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-solar-muted mb-4">No subsidy application found</p>
                <p className="text-sm text-solar-muted">
                  If you're interested in government subsidies, please update your solar profile
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
