import NavigationBar from "../Components/NavigationBar";

const AdminPage = () => {
    
    return (
    <div>
      <NavigationBar />
       <button className="px-3 py-1 border rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors">
        Get Stock Data
      </button>
    </div>
    );
}


export default AdminPage;