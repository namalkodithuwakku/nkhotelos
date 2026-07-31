"use client";
import Login from "../components/Login";
import MobileLogin from "../components/mobile/MobileLogin";
import { useAuth } from "../hooks/useAuth";
import TeamDashboard from "../dashboards/TeamDashboard";
import SupervisorDashboard from "../dashboards/SupervisorDashboard";
import MasterDashboard from "../dashboards/MasterDashboard";
export default function LegacyDashboard(){const{staff,ready,login,logout}=useAuth();if(!ready)return null;if(!staff)return <><div className="desktop-login-wrap"><Login onLogin={login}/></div><div className="mobile-login-wrap"><MobileLogin onLogin={login}/></div></>;const access=String(staff.access||"").trim().toLowerCase();if(access==="master")return <MasterDashboard staff={staff} onLogout={logout}/>;if(access==="supervisor")return <SupervisorDashboard staff={staff} onLogout={logout}/>;return <TeamDashboard staff={staff} onLogout={logout}/>;}
