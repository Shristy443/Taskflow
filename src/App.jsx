import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import DashboardLayout from "./layouts/DashboardLayout";
import MyTasks from "./pages/MyTasks";
import ProjectDetails from "./pages/ProjectDetails";
import Calendar from "./pages/Calender";
import Team from "./pages/Team";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/dashboard" />}
        />

  <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

        <Route
          path="/projects"
          element={
             <ProtectedRoute>
      <DashboardLayout>
        <Projects />
      </DashboardLayout>
    </ProtectedRoute>
          }
        />

     

      <Route
  path="/projects/:id"
  element={
    <ProtectedRoute>
        <DashboardLayout>
      <ProjectDetails />
    </DashboardLayout>
  
    </ProtectedRoute>
  }
  
/>

<Route
  path="/tasks"
  element={
     <ProtectedRoute>
      <DashboardLayout>
        <MyTasks />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/calendar"
  element={
     <ProtectedRoute>
      <DashboardLayout>
        <Calendar />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/team"
  element={
  <ProtectedRoute>
      <DashboardLayout>
        <Team />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/analytics"
  element={
   <ProtectedRoute>
      <DashboardLayout>
        <Analytics />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
     <ProtectedRoute>
      <DashboardLayout>
        <Settings />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route path="/login" element={<Login />} />

<Route path="/register" element={<Register />} />
 </Routes>

    </BrowserRouter>
  );
}

export default App;