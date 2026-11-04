import { formatDate } from "../utils/records.js";

export default function MessageConversation({ message, replies = [] }) {
  return (
    <div className="conversation-thread" aria-label="Conversación">
      <article className="conversation-entry conversation-entry-customer">
        <div className="conversation-entry-heading">
          <strong>{message.name}</strong>
          <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
        </div>
        <p>{message.message}</p>
      </article>
      {replies.map((reply) => (
        <article
          className={`conversation-entry${reply.authorRole === "operator" ? " conversation-entry-operator" : " conversation-entry-customer"}`}
          key={reply.id}
        >
          <div className="conversation-entry-heading">
            <strong>{reply.authorRole === "operator" ? "Equipo" : message.name}</strong>
            <time dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time>
          </div>
          <p>{reply.body}</p>
        </article>
      ))}
    </div>
  );
}
