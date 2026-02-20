import React from "react";

const AdminPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Welcome, Admin!</h2>
      <p>
        This is the admin dashboard. Only users with admin credentials can
        access this page.
      </p>
    </div>
  );
};

export default AdminPage;
