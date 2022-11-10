import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function App() {
  const queryClient = useQueryClient();
  const query = useQuery(["todos"]);

  return <div className="m-20">AppList</div>;
}
