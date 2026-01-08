import CreateRegion from "../pages/superAdmin/CreateRegion";
import GlobalDashboard from "../pages/superAdmin/GlobalDashboard";
import Regions from "../pages/superAdmin/Regions";
import Admins from "../pages/superAdmin/Admins";
import CreateAdmin from "../pages/superAdmin/CreateAdmin";
import Plants from "../pages/superAdmin/Plants";
import CreatePlant from "../pages/superAdmin/CreatePlant";
import Users from "../pages/superAdmin/Users";
import CreateUser from "../pages/superAdmin/CreateUser";
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
    element: Plants,
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
    element: Reports,
    path: `/reports`,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    exact: true
  },
  
  // User Routes
  {
    element: Profile,
    path: `/profile`,
    allowedRoles: ["USER"],
    exact: true
  },
  {
    element: Devices,
    path: `/devices`,
    allowedRoles: ["USER"],
    exact: true
  },
  {
    element: EnergyAnalytics,
    path: `/energy-analytics`,
    allowedRoles: ["USER"],
    exact: true
  },
]
