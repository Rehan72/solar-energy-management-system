import CreateRegion from "../pages/superAdmin/CreateRegion";
import EditRegion from "../pages/superAdmin/EditRegion";
import RegionDetail from "../pages/superAdmin/RegionDetail";
import GlobalDashboard from "../pages/superAdmin/GlobalDashboard";
import Regions from "../pages/superAdmin/Regions";
import Admins from "../pages/superAdmin/Admins";
import CreateAdmin from "../pages/superAdmin/CreateAdmin";
import Plants from "../pages/superAdmin/Plants";
import CreatePlant from "../pages/superAdmin/CreatePlant";
import EditPlant from "../pages/superAdmin/EditPlant";
import PlantDetail from "../pages/superAdmin/PlantDetail";
import Users from "../pages/superAdmin/Users";
import CreateUser from "../pages/superAdmin/CreateUser";
import CreateInstaller from "../pages/superAdmin/CreateInstaller";
import Installers from "../pages/superAdmin/Installers";
import Inventory from "../pages/admin/Inventory";
import InventoryForm from "../components/inventory/InventoryForm";
import InventoryDetail from "../pages/admin/InventoryDetail";
import UserDetail from "../pages/superAdmin/UserDetail";
import EditUser from "../pages/superAdmin/EditUser";
import AdminDetail from "../pages/superAdmin/AdminDetail";
import AdminEdit from "../pages/superAdmin/AdminEdit";
import Reports from "../pages/superAdmin/Reports";
import AdminAnalytics from "../pages/superAdmin/AdminAnalytics";
import AdminDevices from "../pages/admin/Devices";
import Profile from "../pages/user/Profile";
import Devices from "../pages/user/Devices";
import EnergyAnalytics from "../pages/user/EnergyAnalytics";
import Notifications from "../pages/user/Notifications";
import SuperAdminDashboard from "../components/dashboards/SuperAdminDashboard";
import GovtDashboard from "../pages/govt/GovtDashboard";
import InstallerDashboard from "../pages/installer/InstallerDashboard";
import SolarSimulator from "../pages/tool/SolarSimulator";

export const routeParams = "management";

export default [
  // Super Admin Routes
  {
    element: GlobalDashboard,
    path: `/dashboard`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: SuperAdminDashboard,
    path: `/superadmin/dashboard`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: AdminAnalytics,
    path: `/admin/analytics`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: Regions,
    path: `/regions`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: CreateRegion,
    path: `/regions/create`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: EditRegion,
    path: `/regions/:id/edit`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: RegionDetail,
    path: `/regions/:id`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: Admins,
    path: `/admins`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: CreateAdmin,
    path: `/admins/create`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: CreateAdmin,
    path: `/admins/:id/edit`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: AdminDetail,
    path: `/admins/:id`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: Plants,
    path: `/plants`,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    exact: true
  },
  {
    element: CreatePlant,
    path: `/plants/create`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: PlantDetail,
    path: `/plants/:id`,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    exact: true
  },
  {
    element: EditPlant,
    path: `/plants/:id/edit`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: Users,
    path: `/users`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: CreateUser,
    path: `/users/create`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: Installers,
    path: `/installers`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: CreateInstaller,
    path: `/installers/create`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: UserDetail,
    path: `/users/:id`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: EditUser,
    path: `/users/:id/edit`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: AdminDevices,
    path: `/admin/devices`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: Devices,
    path: `/superadmin/all-devices`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: EnergyAnalytics,
    path: `/superadmin/all-energy`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: Profile,
    path: `/superadmin/profile`,
    allowedRoles: ["SUPER_ADMIN"],
    exact: true
  },
  {
    element: Reports,
    path: `/reports`,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    exact: true
  },

  // User Routes
  {
    element: Profile,
    path: `/profile`,
    allowedRoles: ["USER", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: Devices,
    path: `/devices`,
    allowedRoles: ["USER", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: EnergyAnalytics,
    path: `/energy-analytics`,
    allowedRoles: ["USER", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: Notifications,
    path: `/notifications`,
    allowedRoles: ["USER", "ADMIN", "SUPER_ADMIN", "GOVT", "INSTALLER"],
    exact: true
  },

  // GOVERNMENT Routes
  {
    element: GovtDashboard,
    path: `/govt/dashboard`,
    allowedRoles: ["GOVT", "SUPER_ADMIN"],
    exact: true
  },

  // INSTALLER Routes
  {
    element: InstallerDashboard,
    path: `/installer/dashboard`,
    allowedRoles: ["INSTALLER", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: Inventory,
    path: `/admin/inventory`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
  {
    element: SolarSimulator,
    path: `/tool/simulator`,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    exact: true
  },
]
