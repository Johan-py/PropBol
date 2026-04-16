import { useState } from "react";

export function useClusterSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [clusterProperties, setClusterProperties] = useState<any[]>([]);

  const openCluster = (properties: any[]) => {
    setClusterProperties(properties);
    setIsOpen(true);
  };

  const closeCluster = () => {
    setClusterProperties([]);
    setIsOpen(false);
  };

  return { isOpen, clusterProperties, openCluster, closeCluster };
}
