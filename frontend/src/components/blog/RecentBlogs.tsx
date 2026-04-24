import React from "react";
import { MOCK_USER_BLOGS } from "@/lib/mock/blogs.mock";
import UserBlogCard from "./UserBlogCard";

const RecentBlogs = () => {
  // se muestran los blogs que tenemos en el mock
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">Mis blogs recientes</h2>
      <div className="grid grid-cols-1 gap-3">
        {MOCK_USER_BLOGS.map((blog) => (
          <UserBlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default RecentBlogs;
