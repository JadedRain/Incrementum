import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import NavigationBar from '../Components/NavigationBar';
import ScreenerForm from '../Components/CustomScreener/ScreenerForm';
import { ScreenerFormProvider, useScreenerForm } from '../Context/ScreenerFormContext';
import '../App.css';
import '../styles/CustomScreenerPage.css';

const CustomScreenerPageContent = () => {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const { saveCustomScreener } = useScreenerForm();

  const handleSave = async () => {
    if (!apiKey) {
      return;
    }
    await saveCustomScreener(apiKey);
  };

  return (
    <div className="min-h-screen bg-[hsl(40,62%,26%)]">
      <NavigationBar />
      <div className="custom-screener-container">
        <ScreenerForm
          onCancel={() => navigate('/screener')}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

function CustomScreenerPage() {
  return (
    <ScreenerFormProvider>
      <CustomScreenerPageContent />
    </ScreenerFormProvider>
  );
}

export default CustomScreenerPage;