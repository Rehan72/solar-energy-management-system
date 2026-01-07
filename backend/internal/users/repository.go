package users

import (
	"database/sql"
	"sems-backend/internal/database"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Helper function to convert sql.NullString to string
func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

// Helper function to convert string to sql.NullString
func stringToNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// Helper function to convert sql.NullFloat64 to float64
func nullFloat64ToFloat64(nf sql.NullFloat64) float64 {
	if nf.Valid {
		return nf.Float64
	}
	return 0
}

func CreateUser(firstName, lastName, email, passwordHash, role, phone, profileImage, addressLine1, addressLine2, city, state, pincode, region string, latitude, longitude float64) (*User, error) {
	user := &User{
		ID:           uuid.New().String(),
		FirstName:    firstName,
		LastName:     lastName,
		Email:        email,
		PasswordHash: passwordHash,
		Role:         role,
		Phone:        phone,
		ProfileImage: profileImage,
		AddressLine1: addressLine1,
		AddressLine2: addressLine2,
		City:         city,
		State:        state,
		Pincode:      pincode,
		Region:       region,
		Latitude:     latitude,
		Longitude:    longitude,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	query := `
		INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := database.DB.Exec(query, user.ID, user.FirstName, user.LastName, user.Email, user.PasswordHash, user.Role, user.Phone, user.ProfileImage, user.AddressLine1, user.AddressLine2, user.City, user.State, user.Pincode, user.Region, user.Latitude, user.Longitude, user.IsActive, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByEmail(email string) (*User, error) {
	user := &User{}
	var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region sql.NullString
	var latitude, longitude sql.NullFloat64
	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, is_active, created_at, updated_at
		FROM users
		WHERE email = ?`
	err := database.DB.QueryRow(query, email).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
		&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
		&city, &state, &pincode, &region, &latitude, &longitude,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	// Convert nullable fields
	user.Phone = nullStringToString(phone)
	user.ProfileImage = nullStringToString(profileImage)
	user.AddressLine1 = nullStringToString(addressLine1)
	user.AddressLine2 = nullStringToString(addressLine2)
	user.City = nullStringToString(city)
	user.State = nullStringToString(state)
	user.Pincode = nullStringToString(pincode)
	user.Region = nullStringToString(region)
	user.Latitude = nullFloat64ToFloat64(latitude)
	user.Longitude = nullFloat64ToFloat64(longitude)
	user.Role = strings.ToUpper(user.Role)
	return user, nil
}

func GetAllUsers() ([]*User, error) {
	users := []*User{}
	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, is_active, created_at, updated_at
		FROM users`
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		user := &User{}
		var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region sql.NullString
		var latitude, longitude sql.NullFloat64
		err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
			&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
			&city, &state, &pincode, &region, &latitude, &longitude,
			&user.IsActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		// Convert nullable fields
		user.Phone = nullStringToString(phone)
		user.ProfileImage = nullStringToString(profileImage)
		user.AddressLine1 = nullStringToString(addressLine1)
		user.AddressLine2 = nullStringToString(addressLine2)
		user.City = nullStringToString(city)
		user.State = nullStringToString(state)
		user.Pincode = nullStringToString(pincode)
		user.Region = nullStringToString(region)
		user.Latitude = nullFloat64ToFloat64(latitude)
		user.Longitude = nullFloat64ToFloat64(longitude)
		user.Role = strings.ToUpper(user.Role)
		users = append(users, user)
	}
	return users, nil
}

func GetUserByID(id string) (*User, error) {
	user := &User{}
	var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region sql.NullString
	var latitude, longitude sql.NullFloat64
	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, is_active, created_at, updated_at
		FROM users
		WHERE id = ?`
	err := database.DB.QueryRow(query, id).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
		&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
		&city, &state, &pincode, &region, &latitude, &longitude,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	// Convert nullable fields
	user.Phone = nullStringToString(phone)
	user.ProfileImage = nullStringToString(profileImage)
	user.AddressLine1 = nullStringToString(addressLine1)
	user.AddressLine2 = nullStringToString(addressLine2)
	user.City = nullStringToString(city)
	user.State = nullStringToString(state)
	user.Pincode = nullStringToString(pincode)
	user.Region = nullStringToString(region)
	user.Latitude = nullFloat64ToFloat64(latitude)
	user.Longitude = nullFloat64ToFloat64(longitude)
	user.Role = strings.ToUpper(user.Role)
	return user, nil
}

func UpdateUser(user *User) error {
	query := `
		UPDATE users
		SET first_name = ?, last_name = ?, email = ?, role = ?, phone = ?, profile_image = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, region = ?, latitude = ?, longitude = ?, is_active = ?, updated_at = ?
		WHERE id = ?`
	_, err := database.DB.Exec(query, user.FirstName, user.LastName, user.Email, user.Role, user.Phone, user.ProfileImage, user.AddressLine1, user.AddressLine2, user.City, user.State, user.Pincode, user.Region, user.Latitude, user.Longitude, user.IsActive, time.Now(), user.ID)
	return err
}

func DeleteUser(id string) error {
	query := `
		DELETE FROM users
		WHERE id = ?`
	_, err := database.DB.Exec(query, id)
	return err
}
