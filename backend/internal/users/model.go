package users

import (
	"time"
)

type InstallationStatus string

const (
	InstallationStatusNotInstalled InstallationStatus = "NOT_INSTALLED"
	InstallationStatusPlanned      InstallationStatus = "INSTALLATION_PLANNED"
	InstallationStatusInstalled    InstallationStatus = "INSTALLED"
)

type PropertyType string

const (
	PropertyTypeResidential PropertyType = "RESIDENTIAL"
	PropertyTypeCommercial  PropertyType = "COMMERCIAL"
	PropertyTypeIndustrial  PropertyType = "INDUSTRIAL"
)

type ConnectionType string

const (
	ConnectionTypeSinglePhase ConnectionType = "SINGLE_PHASE"
	ConnectionTypeThreePhase  ConnectionType = "THREE_PHASE"
)

type SubsidyStatus string

const (
	SubsidyStatusPending   SubsidyStatus = "PENDING"
	SubsidyStatusApproved  SubsidyStatus = "APPROVED"
	SubsidyStatusRejected  SubsidyStatus = "REJECTED"
	SubsidyStatusDisbursed SubsidyStatus = "DISBURSED"
)

type User struct {
	ID           string  `json:"id" db:"id"`
	FirstName    string  `json:"first_name" db:"first_name"`
	LastName     string  `json:"last_name" db:"last_name"`
	Email        string  `json:"email" db:"email"`
	PasswordHash string  `json:"-" db:"password_hash"`
	Role         string  `json:"role" db:"role"`
	Phone        string  `json:"phone" db:"phone"`
	ProfileImage string  `json:"profile_image" db:"profile_image"`
	AddressLine1 string  `json:"address_line1" db:"address_line1"`
	AddressLine2 string  `json:"address_line2" db:"address_line2"`
	City         string  `json:"city" db:"city"`
	State        string  `json:"state" db:"state"`
	Pincode      string  `json:"pincode" db:"pincode"`
	Region       string  `json:"region" db:"region"`
	AdminID      string  `json:"admin_id" db:"admin_id"`
	InstallerID  string  `json:"installer_id" db:"installer_id"`
	PlantID      string  `json:"plant_id" db:"plant_id"`
	Latitude     float64 `json:"latitude" db:"latitude"`
	Longitude    float64 `json:"longitude" db:"longitude"`

	// Solar-specific fields
	InstallationStatus InstallationStatus `json:"installation_status" db:"installation_status"`
	PropertyType       PropertyType       `json:"property_type" db:"property_type"`

	// For prospective users (planning stage)
	AvgMonthlyBill  float64        `json:"avg_monthly_bill" db:"avg_monthly_bill"`
	RoofAreaSqft    float64        `json:"roof_area_sqft" db:"roof_area_sqft"`
	ConnectionType  ConnectionType `json:"connection_type" db:"connection_type"`
	SubsidyInterest bool           `json:"subsidy_interest" db:"subsidy_interest"`
	ProjectCost     float64        `json:"project_cost" db:"project_cost"`
	TariffRate      float64        `json:"tariff_rate" db:"tariff_rate"`

	// For installed users
	PlantCapacityKW  float64   `json:"plant_capacity_kw" db:"plant_capacity_kw"`
	InstallationDate time.Time `json:"installation_date" db:"installation_date"`
	NetMetering      bool      `json:"net_metering" db:"net_metering"`
	InverterBrand    string    `json:"inverter_brand" db:"inverter_brand"`
	DISCOMName       string    `json:"discom_name" db:"discom_name"`
	ConsumerNumber   string    `json:"consumer_number" db:"consumer_number"`

	// Device linking (optional)
	DeviceLinked     bool      `json:"device_linked" db:"device_linked"`
	DeviceID         string    `json:"device_id" db:"device_id"`
	LastDataReceived time.Time `json:"last_data_received" db:"last_data_received"`

	// Subsidy details
	SubsidyApplied bool          `json:"subsidy_applied" db:"subsidy_applied"`
	SubsidyStatus  SubsidyStatus `json:"subsidy_status" db:"subsidy_status"`
	SchemeName     string        `json:"scheme_name" db:"scheme_name"`
	ApplicationID  string        `json:"application_id" db:"application_id"`

	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// SolarProfile represents the solar-specific profile for a user
type SolarProfile struct {
	ID     string `json:"id" db:"id"`
	UserID string `json:"user_id" db:"user_id"`

	InstallationStatus InstallationStatus `json:"installation_status" db:"installation_status"`
	PropertyType       PropertyType       `json:"property_type" db:"property_type"`
	AdminID            string             `json:"admin_id" db:"admin_id"`
	InstallerID        string             `json:"installer_id" db:"installer_id"`
	PlantID            string             `json:"plant_id" db:"plant_id"`

	// Planning stage fields
	AvgMonthlyBill  float64        `json:"avg_monthly_bill" db:"avg_monthly_bill"`
	RoofAreaSqft    float64        `json:"roof_area_sqft" db:"roof_area_sqft"`
	ConnectionType  ConnectionType `json:"connection_type" db:"connection_type"`
	SubsidyInterest bool           `json:"subsidy_interest" db:"subsidy_interest"`
	ProjectCost     float64        `json:"project_cost" db:"project_cost"`

	// Installed system fields
	PlantCapacityKW  float64   `json:"plant_capacity_kw" db:"plant_capacity_kw"`
	InstallationDate time.Time `json:"installation_date" db:"installation_date"`
	NetMetering      bool      `json:"net_metering" db:"net_metering"`
	InverterBrand    string    `json:"inverter_brand" db:"inverter_brand"`
	DISCOMName       string    `json:"discom_name" db:"discom_name"`
	ConsumerNumber   string    `json:"consumer_number" db:"consumer_number"`

	// Device fields
	DeviceLinked     bool      `json:"device_linked" db:"device_linked"`
	DeviceID         string    `json:"device_id" db:"device_id"`
	LastDataReceived time.Time `json:"last_data_received" db:"last_data_received"`

	// Subsidy fields
	SubsidyApplied bool          `json:"subsidy_applied" db:"subsidy_applied"`
	SubsidyStatus  SubsidyStatus `json:"subsidy_status" db:"subsidy_status"`
	SchemeName     string        `json:"scheme_name" db:"scheme_name"`
	ApplicationID  string        `json:"application_id" db:"application_id"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
