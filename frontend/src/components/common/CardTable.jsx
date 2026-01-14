import React, { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Download, ChevronDown, ChevronRight, Phone, Mail, MapPin, Calendar, User } from "lucide-react";

const CardTable = ({
  users: initialUsers = [],
  title = "Users",
  subtitle = "Manage your users and their information",
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  onBulkExport,
  showPagination = false,
  paginationInfo = null,
  onPrevious,
  onNext
}) => {
  const [users, setUsers] = useState(initialUsers);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Update users when initialUsers prop changes
  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-solar-success/20 text-solar-success border-solar-success/30";
      case "inactive":
        return "bg-solar-muted/20 text-solar-muted border-solar-muted/30";
      case "pending":
        return "bg-solar-warning/20 text-solar-warning border-solar-warning/30";
      default:
        return "bg-solar-yellow/20 text-solar-yellow border-solar-yellow/30";
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      case "moderator":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      default:
        return "bg-solar-yellow/20 text-solar-orange border-solar-yellow/30";
    }
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "female":
        return "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30";
      default:
        return "bg-solar-muted/20 text-solar-muted border-solar-muted/30";
    }
  };

  // Handle individual row selection
  const handleRowSelect = (userId) => {
    setSelectedRows(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Check if a row is selected
  const isRowSelected = (userId) => selectedRows.includes(userId);

  // Handle expand/collapse
  const toggleExpand = (userId, event) => {
    if (event.target.closest('[data-prevent-expand]')) {
      return;
    }
    setExpandedRow(prev => prev === userId ? null : userId);
  };

  const isExpanded = (userId) => expandedRow === userId;

  const handleEdit = (user) => {
    if (onEdit) {
      onEdit(user);
    } else {
      console.log("Edit user:", user);
    }
  };

  const handleDelete = (user) => {
    if (onDelete) {
      onDelete(user);
    } else {
      setUsers(users.filter(u => u.id !== user.id));
      setSelectedRows(selectedRows.filter(id => id !== user.id));
      if (expandedRow === user.id) {
        setExpandedRow(null);
      }
    }
  };

  const handleView = (user) => {
    if (onView) {
      onView(user);
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedRows);
    } else {
      setUsers(users.filter(user => !selectedRows.includes(user.id)));
      setSelectedRows([]);
      setSelectAll(false);
      if (selectedRows.includes(expandedRow)) {
        setExpandedRow(null);
      }
    }
  };

  const handleBulkExport = () => {
    if (onBulkExport) {
      onBulkExport(selectedRows);
    } else {
      const selectedUsers = users.filter(user => selectedRows.includes(user.id));
      console.log("Exporting users:", selectedUsers);
    }
  };

  return (
    <div className="w-full p-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="mb-6 p-4 bg-solar-yellow/10 border border-solar-yellow/20 rounded-xl flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="text-solar-orange font-medium text-lg">
              {selectedRows.length} {title.toLowerCase()}(s) selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              className="text-solar-orange border-solar-yellow/30 hover:bg-solar-yellow/20 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-solar-danger border-solar-danger/30 hover:bg-red-500/20 backdrop-blur-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Header with Select All */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-solar-yellow data-[state=checked]:border-solar-yellow"
          />
          <span className="text-solar-primary font-semibold">
            Select All ({users.length} {title.toLowerCase()})
          </span>
        </div>
        <div className="text-sm text-solar-muted">
          {selectedRows.length > 0 && `${selectedRows.length} selected`}
        </div>
      </div>

      {/* Cards Container */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={(e) => toggleExpand(user.id, e)}
            className={`
              relative rounded-2xl border transition-all duration-300 ease-in-out
              backdrop-blur-sm overflow-hidden cursor-pointer
              group energy-card
              ${isRowSelected(user.id) 
                ? 'bg-solar-yellow/10 border-solar-yellow/30 ring-2 ring-solar-yellow/20' 
                : 'bg-solar-card dark:bg-solar-card border-solar-border dark:border-solar-border'
              }
              hover:shadow-xl hover:scale-[1.02]
              hover:border-l-4 hover:border-l-solar-orange
              ${isExpanded(user.id) ? 'border-l-4 border-l-solar-orange' : ''}
            `}
          >
            {/* Orange left border indicator - always visible */}
            <div className="absolute left-0 top-0 h-full w-1 bg-solar-orange transition-all duration-300" />

            {/* Main Card Content */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                {/* Left Section - Checkbox and Basic Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex items-start gap-3 shrink-0">
                    <div 
                      data-prevent-expand 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isRowSelected(user.id)}
                        onCheckedChange={() => handleRowSelect(user.id)}
                        className="mt-1 data-[state=checked]:bg-solar-yellow data-[state=checked]:border-solar-yellow"
                      />
                    </div>
                    
                    {/* User Avatar */}
                    {user.picture || user.profile_image ? (
                      <img 
                        src={user.picture || user.profile_image} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-solar-yellow/30 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-solar-yellow/20 border-2 border-solar-yellow/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-solar-orange" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className={`text-xl font-bold truncate ${
                        isRowSelected(user.id) 
                          ? 'text-solar-primary dark:text-solar-primary' 
                          : 'text-solar-primary dark:text-solar-primary'
                      }`}>
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                        <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border ${getStatusVariant(user.status)}`}>
                          {user.status?.charAt(0)?.toUpperCase() + user.status?.slice(1) || 'Active'}
                        </Badge>
                        {user.gender && (
                          <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border ${getGenderColor(user.gender)}`}>
                            {user.gender}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 text-solar-orange shrink-0" />
                        <span className="text-solar-muted truncate" title={user.email}>
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="h-4 w-4 text-solar-orange shrink-0" />
                        <span className="text-solar-muted truncate" title={user.phone}>
                          {user.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-solar-orange shrink-0" />
                        <span className="text-solar-muted truncate" title={user.address}>
                          {user.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="h-4 w-4 text-solar-orange shrink-0" />
                        <span className="text-solar-muted truncate">
                          Joined {user.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions and Expand Indicator */}
                <div 
                  className="flex items-center gap-2 shrink-0 ml-4"
                >
                  {/* Expand Indicator - Clickable */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(user.id, e);
                    }}
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                      ${isExpanded(user.id) 
                        ? 'bg-solar-orange/20 text-solar-orange hover:bg-solar-orange/30' 
                        : 'bg-solar-yellow/20 text-solar-orange hover:bg-solar-yellow/30'
                      }
                    `}
                    title={isExpanded(user.id) ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded(user.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-solar-yellow/20 text-solar-orange hover:bg-solar-yellow/40 hover:text-solar-orange transition-all duration-300"
                        title="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-[#Ffffff] dark:bg-solar-card border-solar-border dark:border-solar-border shadow-lg"
                    >
                      <DropdownMenuLabel className="text-solar-primary dark:text-solar-primary">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-solar-border dark:bg-solar-border" />
                      <DropdownMenuItem
                        onClick={() => handleView(user)}
                        className="flex items-center gap-2 text-solar-muted hover:bg-solar-border cursor-pointer"
                      >
                        <Eye className="h-4 w-4 text-solar-orange" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-2 text-solar-muted hover:bg-solar-border cursor-pointer"
                      >
                        <Edit className="h-4 w-4 text-solar-orange" />
                        Edit {title}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-2 text-solar-muted hover:bg-solar-border cursor-pointer"
                      >
                        <Download className="h-4 w-4 text-solar-orange" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-solar-border dark:bg-solar-border" />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user)}
                        className="flex items-center gap-2 text-solar-danger hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete {title}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded(user.id) && (
              <div className="border-t border-solar-border bg-solar-bg/50 dark:bg-solar-bg/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-solar-orange text-sm uppercase tracking-wide">
                      Personal Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-solar-muted">User ID:</span>
                        <span className="text-solar-primary font-medium">{user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Full Name:</span>
                        <span className="text-solar-primary font-medium">{user.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Status:</span>
                        <Badge className={getStatusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Role:</span>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                     
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-solar-orange text-sm uppercase tracking-wide">
                      Location Info
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-solar-muted">City:</span>
                        <span className="text-solar-primary font-medium">{user?.city || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">State:</span>
                        <span className="text-solar-primary font-medium">{user?.state || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Country:</span>
                        <span className="text-solar-primary font-medium">{user._original?.location?.country || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Postcode:</span>
                        <span className="text-solar-primary font-medium">{user?.pincode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-solar-orange text-sm uppercase tracking-wide">
                      Address Info
                    </h4>
                    <div className="space-y-2">
                      
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Address Line 1:</span>
                        <span className="text-solar-primary font-medium">{user.address_line1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-solar-muted">Address Line 2:</span>
                        <span className="text-solar-primary font-medium">{user.address_line2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-16 bg-solar-yellow/10 dark:bg-solar-yellow/5 backdrop-blur-sm rounded-2xl border border-solar-yellow/20">
          <div className="text-solar-orange/50 dark:text-solar-orange/50 mb-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-solar-yellow/20 dark:bg-solar-yellow/10 flex items-center justify-center">
              <User className="h-8 w-8 text-solar-orange" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-solar-primary dark:text-solar-primary mb-2">
            No {title.toLowerCase()} found
          </h3>
          <p className="text-solar-muted text-lg">
            {subtitle}
          </p>
        </div>
      )}

      {/* Footer with Pagination */}
      <div className="mt-6 px-4 py-3 border-t border-solar-border bg-solar-card/50 dark:bg-solar-card/50 rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-solar-muted">
            {showPagination && paginationInfo ? (
              <>
                Showing {paginationInfo.currentPageItems} of {paginationInfo.totalItems} {title.toLowerCase()}
                {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
              </>
            ) : (
              <>
                Showing {users.length} {title.toLowerCase()}
                {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
              </>
            )}
          </p>
          
          {showPagination && paginationInfo && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!paginationInfo.previousPage}
                className="text-solar-orange border-solar-yellow/30 hover:bg-solar-yellow/20"
                onClick={onPrevious}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!paginationInfo.nextPage}
                className="text-solar-orange border-solar-yellow/30 hover:bg-solar-yellow/20"
                onClick={onNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardTable;
