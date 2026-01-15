import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Plus, Trash } from 'lucide-react';
import SolarToaster from '../common/SolarToaster';

const InventoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Solar Panel',
        brand: '',
        model: '',
        description: '',
        price: '',
        stock_qty: '',
        image_url: '',
        gallery: '', // JSON string, simplified to just a text area or simple list for now
        specs: '', // JSON string
        is_active: true
    });

    // Helper for gallery management (simple list of URLs)
    const [galleryUrls, setGalleryUrls] = useState(['']);

    useEffect(() => {
        if (isEdit) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/inventory/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFormData(response.data);
            if (response.data.gallery) {
                try {
                    // Try parsing if valid JSON, else split by comma if simple string
                    const parsed = JSON.parse(response.data.gallery);
                    setGalleryUrls(Array.isArray(parsed) ? parsed : [response.data.gallery]);
                } catch (e) {
                    setGalleryUrls([response.data.gallery]);
                }
            }
        } catch (error) {
            SolarToaster.error("Failed to fetch item details");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGalleryChange = (index, value) => {
        const newUrls = [...galleryUrls];
        newUrls[index] = value;
        setGalleryUrls(newUrls);
    };

    const addGalleryUrl = () => {
        setGalleryUrls([...galleryUrls, '']);
    };

    const removeGalleryUrl = (index) => {
        const newUrls = galleryUrls.filter((_, i) => i !== index);
        setGalleryUrls(newUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare payload
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock_qty: parseInt(formData.stock_qty),
            gallery: JSON.stringify(galleryUrls.filter(u => u.trim() !== ''))
        };

        try {
            const url = isEdit
                ? `http://localhost:8080/inventory/${id}`
                : `http://localhost:8080/inventory`;

            const method = isEdit ? 'put' : 'post';

            await axios[method](url, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            SolarToaster.success(`Item ${isEdit ? 'updated' : 'created'} successfully`);
            navigate('/admin/inventory');
        } catch (error) {
            console.error(error);
            SolarToaster.error(`Failed to ${isEdit ? 'update' : 'create'} item`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Button variant="ghost" onClick={() => navigate('/admin/inventory')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
            </Button>

            <div className="bg-solar-card border border-solar-border rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 text-solar-primary">
                    {isEdit ? 'Edit Inventory Item' : 'Add New Item'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Item Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="solar-input"
                                placeholder="e.g. 500W Monocrystalline Panel"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="solar-input"
                            >
                                <option value="Solar Panel">Solar Panel</option>
                                <option value="Inverter">Inverter</option>
                                <option value="Battery">Battery</option>
                                <option value="Mounting System">Mounting System</option>
                                <option value="Accessory">Accessory</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Brand</label>
                            <input
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="solar-input"
                                placeholder="e.g. Tesla, LG"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Model Number</label>
                            <input
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="solar-input"
                                placeholder="e.g. TS-500-X"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="solar-input min-h-[100px]"
                                placeholder="Detailed product description..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Price ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="solar-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Stock Quantity</label>
                            <input
                                required
                                type="number"
                                name="stock_qty"
                                value={formData.stock_qty}
                                onChange={handleChange}
                                className="solar-input"
                            />
                        </div>
                    </div>

                    <div className="border-t border-solar-border my-6"></div>

                    {/* Media Section */}
                    <h3 className="text-lg font-semibold text-solar-primary mb-4">Images</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Primary Image URL</label>
                            <input
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="solar-input"
                                placeholder="https://..."
                            />
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" className="h-32 rounded-lg border border-solar-border mt-2" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-solar-muted">Gallery Images</label>
                            {galleryUrls.map((url, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        value={url}
                                        onChange={(e) => handleGalleryChange(idx, e.target.value)}
                                        className="solar-input flex-1"
                                        placeholder="Image URL"
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => removeGalleryUrl(idx)}>
                                        <Trash className="w-4 h-4 text-solar-danger" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addGalleryUrl} className="mt-2">
                                <Plus className="w-4 h-4 mr-2" /> Add Image
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" disabled={loading} className="sun-button px-8">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? 'Update Item' : 'Create Item'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryForm;
