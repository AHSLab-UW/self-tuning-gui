import "./styles/App.css";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Admin from "./pages/Admin";
// import Intro1 from "./pages/ConnectToYourDevice1";
import Name from "./pages/Name";
// import Intro2 from "./pages/Intro2";
// import Intro3 from "./pages/Intro3";
import Select from "./pages/Select";
import Prompt from "./pages/Prompt";
import Finish from "./pages/Finish";
import FittingSelect from "./pages/FittingSelect";
import FittingInstruction from "./pages/FittingInstruction";
import FittingInstruction1 from "./pages/FittingInstruction1";
import FittingInstruction2 from "./pages/FittingInstruction2";
import FittingInstruction22 from "./pages/FittingInstruction22";
import GridFitting from "./pages/GridFitting";
import ButtonFitting from "./pages/ButtonFitting";
import ManualFitting from "./pages/Manual_Fitting";
import SplashScreen from "./components/StartMenu";

import CollapsingSidebar from "./components/CollapsingSidebar";
import BottomMenu from "./components/BottomMenu";

const routes = [
  { path: "/", name: "Welcome", element: <Welcome /> },
  { path: "/name", name: "Name", element: <Name /> },
  // { path: "/intro1", name: "Intro 1", element: <Intro1 /> },
  // { path: "/intro2", name: "Intro 2", element: <Intro2 /> },
  // { path: "/intro3", name: "Intro 3", element: <Intro3 /> },
  { path: "/select", name: "Select", element: <Select /> },
  { path: "/fit-select", name: "Fitting Select", element: <FittingSelect /> },
  {
    path: "/fit-instruct",
    name: "Fitting Instruction",
    element: <FittingInstruction />,
  },
  {
    path: "/fit-instruct1",
    name: "Fitting Instruction",
    element: <FittingInstruction1 />,
  },
  {
    path: "/fit-instruct2",
    name: "Fitting Instruction2",
    element: <FittingInstruction2 />,
  },
  {
    path: "/fit-instruct22",
    name: "Fitting Instruction2",
    element: <FittingInstruction22 />,
  },
  { path: "/manual_fit", name: "ManualFitting", element: <ManualFitting /> },
  { path: "/buttons", name: "ButtonFitting", element: <ButtonFitting /> },
  { path: "/grid", name: "GridFitting", element: <GridFitting /> },
  { path: "/prompt", name: "Prompt", element: <Prompt /> },
  { path: "/finish", name: "Finish", element: <Finish /> },
  { path: "/admin", name: "Admin", element: <Admin /> },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  let navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="App">
      <>
        <CollapsingSidebar open={sidebarOpen} closeModal={toggleSidebar} />

        <Routes>
          {routes.map((route) => (
            <Route key={route.name} path={route.path} element={route.element} />
          ))}
        </Routes>

        <BottomMenu
          menuCallback={toggleSidebar}
          batteryCallback={() => {}}
          helpCallback={() => {}}
          settingCallback={() => {
            const name = localStorage.getItem("name");
            if (name === "admin") {
              navigate("/admin");
            }
          }}
        />
      </>
    </div>
  );
}

export default App;
