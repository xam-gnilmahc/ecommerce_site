import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/authContext";

const CronJob = () => {
     const { sendDeliverEmail } = useAuth();

    const hasRun = useRef(false);

useEffect(() => {
  if (!hasRun.current) {
    hasRun.current = true;
    (async () => await sendDeliverEmail())();
  }
}, []);

  return (
    <div>
      
    </div>
  )
}

export default CronJob
