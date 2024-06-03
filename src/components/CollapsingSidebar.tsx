import "../styles/CollapsingSidebar.css";
import closeIcon from "../assets/imgs/close.png";
import ear from "../assets/imgs/Logo-Blue.png";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  closeModal: Function;
}

const CollapsingSidebar = (props: Props) => {
  let className = "sidebar";
  if (props.open) {
    className += " open";
  }

  return (

      <div className="sidebar-header">
        
            <div className={className}>
          
        {localStorage.getItem("name") ? localStorage.getItem("name") : "[Name]"}{" "}
        {localStorage.getItem("scene")
          ? localStorage.getItem("scene")
          : "[Scene]"}{" "}
        {localStorage.getItem("fitType") ? localStorage.getItem("fitType") : "[fitType]"}

      <div className={"sidebar-body " + (props.open ? "" : "disabled-link")}>
        <img
            src={closeIcon}
            alt="Close sidebar"
            style={{ maxWidth: 120,  marginLeft: 280, marginTop:-55, marginBottom: 55  }}
            className="icon"
            onClick={() => props.closeModal()}
          />
        <Link className="link" to="/">
          Home
        </Link>
        <Link className="link" to="/name">
          Name
        </Link>
        {/* <Link className="link" to="/intro1">
          Connect To Your Devices, 1/2
        </Link>
        <Link className="link" to="/intro2">
          Connect To Your Devices, 2/2
        </Link>
        <Link className="link" to="/intro3">
          Audio Play
        </Link> */}
        <Link className="link" to="/manual_fit">
          Manual Fitting
        </Link>

        <Link className="link" to="/select">
          Select Location
        </Link>

        <Link className="link" to="/fit-select">
          Fitting Select
        </Link>
        {/* <Link className="link" to="/prompt">
          Reset Settings
        </Link> */}
        <Link className="link" to="/finish">
          Finish
        </Link>
        <img  src={ear} alt={"logo"} style={{ maxWidth: 125, marginTop: 250, marginLeft: 100  }}></img>
    
      </div>



</div>

    </div>
  );
};

export default CollapsingSidebar;
