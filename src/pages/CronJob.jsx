import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/authContext";

const CronJob = () => {
     const { sendAllDeliveryEmails } = useAuth();

    const hasRun = useRef(false);

useEffect(() => {
  if (!hasRun.current) {
    hasRun.current = true;
    (async () => await sendAllDeliveryEmails())();
  }
}, []);

  return (
    <div>
      
    </div>
  )
}

export default CronJob
