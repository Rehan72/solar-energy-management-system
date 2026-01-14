import { useState, useEffect } from "react";
import { getRequest, putRequest } from "../../lib/apiService";
import { notify } from "../../lib/toast";
import { User, Shield, MapPin, Phone, Mail, Edit, Save, X, Globe, Zap, Sun, Battery, Activity, ShieldCheck, CreditCard, Droplets, Info, Settings, RefreshCw, Cpu, BadgeCheck } from "lucide-react";
import SunLoader from "../../components/SunLoader";

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
    const configs = {
      NOT_INSTALLED: "border-solar-muted/30 text-solar-muted bg-solar-muted/5",
      INSTALLATION_PLANNED: "border-solar-yellow/30 text-solar-yellow bg-solar-yellow/5",
      INSTALLED: "border-solar-success/30 text-solar-success bg-solar-success/5",
      PENDING: "border-solar-yellow/30 text-solar-yellow bg-solar-yellow/5",
      APPROVED: "border-solar-success/30 text-solar-success bg-solar-success/5",
      REJECTED: "border-solar-danger/30 text-solar-danger bg-solar-danger/5",
      DISBURSED: "border-solar-primary/30 text-solar-primary bg-solar-primary/5",
    };
    return configs[status] || "border-solar-muted/30 text-solar-muted bg-solar-muted/5";
  };

  if (loading) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Acquiring personnel telemetry..." size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Personnel Nexus</h1>
            <p className="text-solar-muted mt-1 font-medium italic">Comprehensive oversight of user identity and solar grid configurations.</p>
          </div>
          <div className="w-16 h-16 solar-glass rounded-2xl flex items-center justify-center border border-solar-border/30">
            <User size={32} className="text-solar-yellow" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 p-1.5 solar-glass rounded-2xl border-solar-border/10 mb-10 w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              activeTab === "profile"
                ? "bg-linear-to-br from-solar-panel to-solar-yellow text-solar-dark shadow-lg shadow-solar-yellow/20"
                : "text-solar-muted hover:text-solar-primary"
            }`}
          >
            Identity
          </button>
          <button
            onClick={() => setActiveTab("solar")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              activeTab === "solar"
                ? "bg-linear-to-br from-solar-panel to-solar-yellow text-solar-dark shadow-lg shadow-solar-yellow/20"
                : "text-solar-muted hover:text-solar-primary"
            }`}
          >
            Solar Node
          </button>
          <button
            onClick={() => setActiveTab("subsidy")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              activeTab === "subsidy"
                ? "bg-linear-to-br from-solar-panel to-solar-yellow text-solar-dark shadow-lg shadow-solar-yellow/20"
                : "text-solar-muted hover:text-solar-primary"
            }`}
          >
            Subsidy Channel
          </button>
        </div>

        {/* Personal Info Tab */}
        {activeTab === "profile" && (
          <div className="solar-glass rounded-3xl p-8 border-solar-panel/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-32 h-32 text-solar-yellow" />
            </div>
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h2 className="text-xs font-black text-solar-primary tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline">
                <Shield className="w-4 h-4 mr-3 inline text-solar-yellow" />
                Primary Identity Protocol
              </h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="sun-button px-8 py-2"
                >
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
                    <Edit className="w-4 h-4" />
                    <span>Modify Protocol</span>
                  </div>
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile();
                    }}
                    className="text-[10px] font-black text-solar-muted uppercase tracking-widest hover:text-solar-primary transition-colors underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="sun-button px-8 py-2"
                  >
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
                      <Save className="w-4 h-4" />
                      <span>{saving ? "Syncing..." : "Sync Changes"}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Forename Alpha</label>
                {editMode ? (
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="solar-input"
                  />
                ) : (
                  <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                    {user?.first_name || "Unassigned"}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Surname Beta</label>
                {editMode ? (
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="solar-input"
                  />
                ) : (
                  <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                    {user?.last_name || "Unassigned"}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Communication Uplink (Email)</label>
                <div className="flex items-center space-x-3 text-solar-muted italic">
                  <Mail className="w-4 h-4 text-solar-yellow" />
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Signal Reference (Phone)</label>
                {editMode ? (
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="solar-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-solar-yellow" />
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      {user?.phone || "Awaiting Data"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Geospatial Metadata (Address)</label>
                {editMode ? (
                  <div className="space-y-4">
                    <input
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      placeholder="Primary Sector / Building"
                      className="solar-input"
                    />
                    <input
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      placeholder="Secondary Sector / Area"
                      className="solar-input"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="solar-input"
                      />
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="solar-input"
                      />
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        className="solar-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-5 h-5 text-solar-yellow shrink-0 mt-1" />
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight leading-relaxed">
                      {[user?.address_line1, user?.address_line2, user?.city, user?.state, user?.pincode]
                        .filter(Boolean)
                        .join(", ") || "No sector assigned"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Solar Details Tab */}
        {activeTab === "solar" && (
          <div className="solar-glass rounded-3xl p-8 border-solar-panel/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sun className="w-48 h-48 text-solar-yellow" />
            </div>
            
            <h2 className="text-xs font-black text-solar-primary tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline mb-10 relative z-10">
              <Sun className="w-4 h-4 mr-3 inline text-solar-yellow" />
              Photovoltaic Node Configuration
            </h2>

            {/* Status Banner */}
            <div className={`p-6 rounded-2xl mb-10 border relative z-10 flex items-center justify-between ${getStatusBadge(user?.installation_status)}`}>
              <div className="flex items-center space-x-4">
                <Zap className="w-6 h-6 animate-pulse" />
                <span className="text-sm font-black uppercase tracking-[0.2em]">
                  Deployment Phase: {user?.installation_status?.replace("_", " ")}
                </span>
              </div>
              <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Asset Architecture</label>
                <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                  {user?.property_type || "Undefined"}
                </p>
              </div>

              {(user?.installation_status === "NOT_INSTALLED" || user?.installation_status === "INSTALLATION_PLANNED") && (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Mean Operational Cost (Bill)</label>
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      ₹{user?.avg_monthly_bill || 0} <span className="text-xs font-bold text-solar-muted">/ CYCLE</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Interceptor Surface Area</label>
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      {user?.roof_area_sqft || "0"} <span className="text-xs font-bold text-solar-muted uppercase">Sq Ft</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">System Phase Modulation</label>
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      {user?.connection_type?.replace("_", " ") || "Single Stage"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Subsidy Protocol Interest</label>
                    <div className="flex items-center space-x-2">
                       <ShieldCheck className={`w-4 h-4 ${user?.subsidy_interest ? 'text-solar-success' : 'text-solar-muted'}`} />
                       <p className={`text-lg font-black uppercase tracking-tight ${user?.subsidy_interest ? 'text-solar-success' : 'text-solar-muted'}`}>
                         {user?.subsidy_interest ? "Active Interest" : "Deactivated"}
                       </p>
                    </div>
                  </div>
                </>
              )}

              {user?.installation_status === "INSTALLED" && (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Node Photon Yield</label>
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      {user?.plant_capacity_kw || 0} <span className="text-xs font-bold text-solar-muted uppercase">kW Peak</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Net Propagation Status</label>
                    <div className="flex items-center space-x-2">
                       <Activity className={`w-4 h-4 ${user?.net_metering ? 'text-solar-success' : 'text-solar-muted'}`} />
                       <p className={`text-lg font-black uppercase tracking-tight ${user?.net_metering ? 'text-solar-success' : 'text-solar-muted'}`}>
                         {user?.net_metering ? "Bi-Directional Active" : "Disabled"}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Inverter Core Processor</label>
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      {user?.inverter_brand || "Generic Protocol"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Grid Interconnect (DISCOM)</label>
                    <div className="flex items-center space-x-2 italic">
                       <Globe className="w-4 h-4 text-solar-primary" />
                       <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                         {user?.discom_name || "Central Grid"}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Consumer Reference Index</label>
                    <div className="flex items-center space-x-2">
                       <CreditCard className="w-4 h-4 text-solar-yellow" />
                       <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                         {user?.consumer_number || "Awaiting Reference"}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Hardware Synapse (Device)</label>
                    <div className="flex items-center space-x-2">
                       <Cpu className={`w-4 h-4 ${user?.device_linked ? 'text-solar-success' : 'text-solar-danger'}`} />
                       <p className={`text-sm font-black uppercase tracking-tight ${user?.device_linked ? 'text-solar-success' : 'text-solar-danger'}`}>
                         {user?.device_linked ? `SYNCHRONIZED: ${user.device_id}` : "SIGNAL LOST: NO LINK"}
                       </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Update Solar Profile Section */}
            <div className="mt-12 pt-10 border-t border-solar-border/10 relative z-10">
              <h3 className="text-xs font-black text-solar-primary mb-8 flex items-center tracking-tight uppercase italic">
                <Settings className="w-4 h-4 mr-3 text-solar-yellow" />
                Recalibrate System parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Node Status Phase</label>
                  <select
                    name="installation_status"
                    value={formData.installation_status}
                    onChange={handleChange}
                    className="solar-input"
                  >
                    <option value="NOT_INSTALLED">Planning (Proto-Node)</option>
                    <option value="INSTALLATION_PLANNED">Scheduled Deployment</option>
                    <option value="INSTALLED">Synchronized (Live Node)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Property Matrix</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="solar-input"
                  >
                    <option value="RESIDENTIAL">Res-Nexus (Home)</option>
                    <option value="COMMERCIAL">Com-Nexus (Business)</option>
                    <option value="INDUSTRIAL">Ind-Nexus (Heavy Ops)</option>
                  </select>
                </div>
              </div>

              {formData.installation_status !== "INSTALLED" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Cycle Flux (Bill ₹)</label>
                    <input
                      name="avg_monthly_bill"
                      type="number"
                      value={formData.avg_monthly_bill}
                      onChange={handleChange}
                      className="solar-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Surface Volume (Sq Ft)</label>
                    <input
                      name="roof_area_sqft"
                      type="number"
                      value={formData.roof_area_sqft}
                      onChange={handleChange}
                      className="solar-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Phase Alignment</label>
                    <select
                      name="connection_type"
                      value={formData.connection_type}
                      onChange={handleChange}
                      className="solar-input"
                    >
                      <option value="SINGLE_PHASE">Unified Phase (Single)</option>
                      <option value="THREE_PHASE">Tri-Phase Modulation</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">System Output (kW)</label>
                    <input
                      name="plant_capacity_kw"
                      type="number"
                      value={formData.plant_capacity_kw}
                      onChange={handleChange}
                      className="solar-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Hardware Brand</label>
                    <input
                      name="inverter_brand"
                      value={formData.inverter_brand}
                      onChange={handleChange}
                      className="solar-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Grid Authority</label>
                    <input
                      name="discom_name"
                      value={formData.discom_name}
                      onChange={handleChange}
                      className="solar-input"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSolarProfile}
                disabled={saving}
                className="sun-button px-10 py-3 disabled:opacity-50"
              >
                <div className="flex items-center space-x-3 font-black uppercase tracking-tight">
                  <RefreshCw className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? "PROPAGATING DATA..." : "CALIBRATE SOLAR NODE"}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Subsidy Status Tab */}
        {activeTab === "subsidy" && (
          <div className="solar-glass rounded-3xl p-8 border-solar-panel/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-48 h-48 text-solar-primary" />
            </div>
            
            <h2 className="text-xs font-black text-solar-primary tracking-tight uppercase italic decoration-solar-primary decoration-2 underline-offset-4 underline mb-10 relative z-10">
              <ShieldCheck className="w-4 h-4 mr-3 inline text-solar-primary" />
              Incentive Allocation Registry
            </h2>

            {user?.subsidy_applied ? (
              <div className="space-y-8 relative z-10">
                <div className={`p-6 rounded-2xl border flex items-center justify-between ${getStatusBadge(user?.subsidy_status)}`}>
                  <div className="flex items-center space-x-4">
                    <Activity className="w-6 h-6" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Registry Status: {user?.subsidy_status}</span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse shadow-sm" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Government Scheme ID</label>
                    <p className="text-lg font-black text-solar-primary uppercase tracking-tight">
                      {user?.scheme_name || "Proto-Incentive Alpha"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em]">Registry Reference (Application ID)</label>
                    <div className="bg-solar-night/40 p-4 rounded-xl border border-white/5 w-fit">
                       <p className="text-xs font-black text-solar-yellow uppercase tracking-tighter">
                         {user?.application_id || "AWAITING_ENROLLMENT"}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 solar-glass bg-solar-primary/5 rounded-2xl p-6 border-solar-primary/20">
                   <div className="flex items-start space-x-4">
                      <Info className="w-5 h-5 text-solar-primary shrink-0 mt-1" />
                      <p className="text-xs font-medium text-solar-muted italic leading-relaxed">
                        Allocation signals are processed via the central grid authority. Latency may occur during high-volume propagation periods.
                      </p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 relative z-10">
                <div className="w-20 h-20 bg-solar-panel/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-solar-border/30">
                  <BadgeCheck size={40} className="text-solar-muted opacity-20" />
                </div>
                <h3 className="text-2xl font-black text-solar-primary mb-3 uppercase tracking-tight">Access Restricted</h3>
                <p className="text-solar-muted font-medium italic mb-10 max-w-sm mx-auto leading-relaxed">
                  Government incentive protocols have not been initialized for this node. Update your solar grid telemetry to begin authorization.
                </p>
                <button 
                  onClick={() => setActiveTab("solar")}
                  className="sun-button px-10 py-3"
                >
                  Configure Grid Telemetry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
