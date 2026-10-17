export default function FieldFeedback({ id, message }: { id: string; message?: string | null }) {
  return message ? (
    <p id={id} role="alert" className="text-body font-medium text-feedback-error">
      {message}
    </p>
  ) : null;
}
