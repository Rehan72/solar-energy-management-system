import GlobalDashboard from "..//pages/superAdmin/GlobalDashboard";
import Regions from "../pages/superAdmin/Regions";
import Admins from "../pages/superAdmin/Admins";
import CreateAdmin from "../pages/superAdmin/CreateAdmin";
import Plants from "../pages/superAdmin/Plants";
import Users from "../pages/superAdmin/Users";
import CreateUser from "../pages/superAdmin/CreateUser";
import UserDetail from "../pages/superAdmin/UserDetail";
import EditUser from "../pages/superAdmin/EditUser";
import AdminDetail from "../pages/superAdmin/AdminDetail";
import AdminEdit from "../pages/superAdmin/AdminEdit";
import Reports from "../pages/superAdmin/Reports";

export const routeParams = "management";

export default [
    {
      element: GlobalDashboard,
      path: `/dashboard`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: Regions,
      path: `/regions`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: Admins,
      path: `/admins`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: CreateAdmin,
      path: `/admins/create`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: AdminDetail,
      path: `/admins/:id`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: AdminEdit,
      path: `/admins/:id/edit`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: Plants,
      path: `/plants`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: Users,
      path: `/users`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: CreateUser,
      path: `/users/create`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: UserDetail,
      path: `/users/:id`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: EditUser,
      path: `/users/:id/edit`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },
    {
      element: Reports,
      path: `/reports`,
      //permission: RoutePermission?.PLATFORM_ADMIN,
      exact: true
    },

]