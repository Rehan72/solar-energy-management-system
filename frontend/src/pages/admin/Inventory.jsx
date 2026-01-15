import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import { Button } from '../../components/ui/button';
import { Plus, Eye, Edit, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SolarToaster from '../../components/common/SolarToaster';

const Inventory = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Inventory Items
    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:8080/inventory');
            // Handle response structure { items: [...] } or just [...]
            const data = response.data.items || response.data || [];
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            SolarToaster.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`http://localhost:8080/inventory/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                SolarToaster.success("Item deleted successfully");
                fetchItems();
            } catch (error) {
                SolarToaster.error("Failed to delete item");
            }
        }
    };

    const columns = [
        {
            header: "Image",
            accessorKey: "image_url",
            cell: (row) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-solar-night/10 border border-solar-border flex items-center justify-center">
                    {row.image_url ? (
                        <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
                    ) : (
                        <Package className="text-solar-muted w-6 h-6" />
                    )}
                </div>
            ),
        },
        {
            header: "Name",
            accessorKey: "name",
            className: "font-semibold text-solar-primary",
        },
        {
            header: "Category",
            accessorKey: "category",
        },
        {
            header: "Brand",
            accessorKey: "brand",
        },
        {
            header: "Stock",
            accessorKey: "stock_qty",
            cell: (row) => (
                <span className={row.stock_qty < 10 ? "text-red-500 font-bold" : "text-green-500"}>
                    {row.stock_qty}
                </span>
            )
        },
        {
            header: "Price",
            accessorKey: "price",
            cell: (row) => `$${row.price?.toFixed(2)}`
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: (row) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/inventory/${row.id}`)}>
                        <Eye className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/inventory/edit/${row.id}`)}>
                        <Edit className="w-4 h-4 text-solar-orange" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-solar-card/50 p-6 rounded-2xl border border-solar-border backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold text-solar-primary">Inventory Management</h1>
                    <p className="text-solar-muted">Manage solar panels, inverters, and equipment</p>
                </div>
                <Button onClick={() => navigate('/admin/inventory/new')} className="bg-solar-yellow text-solar-dark hover:bg-solar-yellow/90 font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            <div className="bg-solar-card/50 rounded-2xl border border-solar-border overflow-hidden backdrop-blur-sm">
                {loading ? (
                    <div className="p-8 text-center text-solar-muted">Loading inventory...</div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={items}
                        searchable={true}
                        searchKey="name"
                    />
                )}
            </div>
        </div>
    );
};

export default Inventory;
