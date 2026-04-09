import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { usePreferences } from '../Context/usePreferences';
import NavigationBar from '../Components/NavigationBar';
import ScreenerForm from '../Components/CustomScreener/ScreenerForm';
import { ScreenerFormProvider, useScreenerForm } from '../Context/ScreenerFormContext';
import '../App.css';
import '../styles/CustomScreenerPage.css';

const CustomScreenerPageContent = () => {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const { defaultPrivate } = usePreferences();
  const { saveCustomScreener } = useScreenerForm();

  const handleSave = async () => {
    if (!apiKey) {
      // For logged-out users, just navigate to screener results without saving
      navigate('/screener/custom_temp');
      return;
    }
    await saveCustomScreener(apiKey, defaultPrivate);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavigationBar />
      <div className="custom-screener-container">
        <ScreenerForm
          onCancel={() => navigate('/screener/custom_temp')}
          onSave={handleSave}
          showNameInput={!!apiKey}
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