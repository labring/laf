import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function App() {
  const queryClient = useQueryClient();
  const query = useQuery(["todos"]);

  return <div className="m-20">AppList</div>;
}
