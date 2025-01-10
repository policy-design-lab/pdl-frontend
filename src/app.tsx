import React from "react";
import Main from "./main";
import { config } from "./app.config";

export default function App(): JSX.Element {
    React.useEffect(() => {
        const src = `https://www.googletagmanager.com/gtag/js?id=G-${config.ga_tracking_id}`;
        const content = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${config.ga_tracking_id}');`;

        // Dynamically insert script into the head
        const script1 = document.createElement("script");
        script1.src = src;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.innerHTML = content;
        document.head.appendChild(script2);

        return () => {
            document.head.removeChild(script1);
        };
    }, []);
    return (
        <div>
            <Main />
        </div>
    );
}
