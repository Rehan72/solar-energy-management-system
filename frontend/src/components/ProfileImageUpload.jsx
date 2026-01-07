import { useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'

const ProfileImageUpload = ({
  profileImagePreview,
  onImageUpload,
  error,
  variant = 'default', // 'default' or 'drag-drop'
  label = 'Profile Image',
  optional = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}) => {
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > maxSize) {
        onImageUpload(null, 'Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        onImageUpload(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (variant === 'drag-drop') {
    return (
      <div className={`md:col-span-2 ${className}`}>
        <label className="block text-sm font-medium text-solar-primary mb-2">
          <Camera className="w-4 h-4 inline mr-2" />
          {label} {optional && '(Optional)'}
        </label>
        <div className="flex items-start space-x-6">
          <div className="relative">
            {profileImagePreview ? (
              <div className="relative">
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-solar-yellow"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-solar-danger text-white rounded-full p-1 hover:bg-solar-danger/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-solar-night/80 border-2 border-dashed border-solar-yellow/50 flex items-center justify-center">
                <Camera className="w-8 h-8 text-solar-muted" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="border-2 border-dashed border-solar-yellow/30 rounded-lg p-6 text-center hover:border-solar-yellow/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                ref={fileInputRef}
              />
              <Upload className="w-8 h-8 text-solar-yellow mx-auto mb-2" />
              <p className="text-sm text-solar-primary">Click to upload or drag and drop</p>
              <p className="text-xs text-solar-muted mt-1">PNG, JPG up to 5MB</p>
            </div>
            {error && (
              <p className="text-sm text-red-800 mt-1">{error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant (simple circular upload)
  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-medium text-solar-primary mb-2">
        <Camera className="w-4 h-4 inline mr-2" />
        {label} {optional && '(Optional)'}
      </label>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-solar-yellow bg-solar-night/80 flex items-center justify-center">
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-12 h-12 text-solar-muted flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
            )}
          </div>
          {profileImagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
            >
              ×
            </button>
          )}
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="profile-image"
          />
          <label
            htmlFor="profile-image"
            className="flex items-center space-x-2 px-4 py-2 bg-solar-panel/50 border border-solar-yellow/30 rounded-lg text-solar-primary hover:bg-solar-panel/80 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </label>
          <p className="text-xs text-solar-muted mt-2">Max size: 5MB. Formats: JPG, PNG, GIF</p>
          {error && <p className="text-sm text-red-800 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default ProfileImageUpload