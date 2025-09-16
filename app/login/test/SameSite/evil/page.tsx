export default function EvilPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-red-600">Evil.com 😈</h1>
      <p>
        Form này sẽ POST đến {" "}
        <code>http://localhost:3000/api/test/SameSite/profile</code>
      </p>

      <form
        method="POST"
        action="http://localhost:3000/api/test/SameSite/profile"
      >
        <button
          type="submit"
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Gửi POST từ evil
        </button>
      </form>
    </div>
  );
}