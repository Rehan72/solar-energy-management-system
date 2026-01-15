import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Edit, AlertCircle, ShoppingCart } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const InventoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gallery, setGallery] = useState([]);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/inventory/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setItem(response.data);
                if (response.data.gallery) {
                    try {
                        const parsed = JSON.parse(response.data.gallery);
                        setGallery(Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        // ignore invalid json
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-solar-muted">Loading details...</div>;
    if (!item) return <div className="p-10 text-center text-red-500">Item not found</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <Button variant="ghost" onClick={() => navigate('/admin/inventory')} className="text-solar-muted hover:text-solar-primary">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left: Images */}
                <div className="space-y-4">
                    <div className="aspect-square bg-solar-night/10 rounded-2xl border border-solar-border overflow-hidden flex items-center justify-center">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-solar-muted">No Image</span>
                        )}
                    </div>
                    {/* Gallery Grid */}
                    {gallery.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                            {gallery.map((url, idx) => (
                                <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border border-solar-border cursor-pointer hover:ring-2 hover:ring-solar-yellow">
                                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-start">
                            <Badge variant="outline" className="mb-2 text-solar-orange border-solar-orange/30">
                                {item.category}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/admin/inventory/edit/${item.id}`)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit Item
                            </Button>
                        </div>

                        <h1 className="text-4xl font-bold text-solar-primary mb-2">{item.name}</h1>
                        <p className="text-xl text-solar-muted">{item.brand} {item.model}</p>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-3xl font-bold text-solar-success">${item.price?.toFixed(2)}</span>
                        {item.stock_qty > 0 ? (
                            <span className="text-sm font-medium text-green-500 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                In Stock ({item.stock_qty})
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-red-500 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <div className="prose prose-invert max-w-none text-solar-muted">
                        <p>{item.description || "No description available."}</p>
                    </div>

                    <div className="bg-solar-card/30 p-6 rounded-xl border border-solar-border space-y-4">
                        <h3 className="font-semibold text-solar-primary">Quick Specs</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between border-b border-solar-border pb-2">
                                <span className="text-solar-muted">Brand</span>
                                <span className="font-medium">{item.brand || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-solar-border pb-2">
                                <span className="text-solar-muted">Model</span>
                                <span className="font-medium">{item.model || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-solar-border pb-2">
                                <span className="text-solar-muted">Stock</span>
                                <span className="font-medium">{item.stock_qty}</span>
                            </div>
                            <div className="flex justify-between border-b border-solar-border pb-2">
                                <span className="text-solar-muted">Category</span>
                                <span className="font-medium">{item.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDetail;
