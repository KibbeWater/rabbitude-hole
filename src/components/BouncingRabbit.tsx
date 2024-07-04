"use client";

import Image from "next/image";

import RabbitudeLogo from "~/assets/rabbitude.png";

export default function BouncingRabbit({ size }: { size: number }) {
    return (
        <div className="bouncing-rabbit">
            <style jsx>{`
                .bouncing-rabbit {
                    animation: bounce 3s infinite ease-in-out;
                }

                @keyframes bounce {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
            <Image src={RabbitudeLogo} alt="Rabbitude Logo" width={size} height={size} />
        </div>
    );
}
