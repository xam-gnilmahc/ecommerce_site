import React, { useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";

const CronJob = () => {
  const { sendAllDeliveryEmails } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      (async () => {
        console.log("Triggered sendAllDeliveryEmails");
        await sendAllDeliveryEmails();
        console.log("Done sending");
      })();
    }
  }, []);

  return <div>Triggering delivery emails...</div>;
};

export default CronJob;
