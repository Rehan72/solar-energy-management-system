package inventory

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateItem(ctx context.Context, item *InventoryItem) error {
	item.ID = uuid.New().String()
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	item.IsActive = true

	query := `
		INSERT INTO inventory_items (
			id, name, category, brand, model, description, price, stock_qty, 
			image_url, gallery, specs, is_active, created_at, updated_at
		) VALUES (
			?, ?, ?, ?, ?, ?, ?, ?, 
			?, ?, ?, ?, ?, ?
		)
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.Name, item.Category, item.Brand, item.Model, item.Description, item.Price, item.StockQty,
		item.ImageURL, item.Gallery, item.Specs, item.IsActive, item.CreatedAt, item.UpdatedAt,
	)
	return err
}

func (r *Repository) GetItemByID(ctx context.Context, id string) (*InventoryItem, error) {
	item := &InventoryItem{}
	query := `SELECT id, name, category, brand, model, description, price, stock_qty, image_url, gallery, specs, is_active, created_at, updated_at FROM inventory_items WHERE id = ?`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&item.ID, &item.Name, &item.Category, &item.Brand, &item.Model, &item.Description, &item.Price, &item.StockQty,
		&item.ImageURL, &item.Gallery, &item.Specs, &item.IsActive, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *Repository) GetAllItems(ctx context.Context) ([]InventoryItem, error) {
	query := `SELECT id, name, category, brand, model, description, price, stock_qty, image_url, gallery, specs, is_active, created_at, updated_at FROM inventory_items ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []InventoryItem
	for rows.Next() {
		var i InventoryItem
		if err := rows.Scan(
			&i.ID, &i.Name, &i.Category, &i.Brand, &i.Model, &i.Description, &i.Price, &i.StockQty,
			&i.ImageURL, &i.Gallery, &i.Specs, &i.IsActive, &i.CreatedAt, &i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *Repository) UpdateItem(ctx context.Context, item *InventoryItem) error {
	item.UpdatedAt = time.Now()
	query := `
		UPDATE inventory_items SET 
			name=?, category=?, brand=?, model=?, description=?, price=?, stock_qty=?, 
			image_url=?, gallery=?, specs=?, is_active=?, updated_at=?
		WHERE id=?
	`
	_, err := r.db.ExecContext(ctx, query,
		item.Name, item.Category, item.Brand, item.Model, item.Description, item.Price, item.StockQty,
		item.ImageURL, item.Gallery, item.Specs, item.IsActive, item.UpdatedAt, item.ID,
	)
	return err
}

func (r *Repository) DeleteItem(ctx context.Context, id string) error {
	query := `DELETE FROM inventory_items WHERE id = ?`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("item not found")
	}
	return nil
}
