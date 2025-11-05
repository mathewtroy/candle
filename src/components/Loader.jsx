export default function Loader({ text = "Loading..." }) {
  return (
    <p className="text-center text-gray animate__animated animate__fadeIn">
      {text}
    </p>
  );
}
