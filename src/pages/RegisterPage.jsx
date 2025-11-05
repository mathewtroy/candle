import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { useRegisterUser } from "../hooks/useRegisterUser";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { handleRegister, loading, uploadingAvatar } = useRegisterUser();

  const onSubmit = async (formData) => {
    const success = await handleRegister(formData);
    if (success) {
      navigate(`/${formData.username}`);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <RegisterForm onSubmit={onSubmit} loading={loading} uploadingAvatar={uploadingAvatar} />
    </div>
  );
}
