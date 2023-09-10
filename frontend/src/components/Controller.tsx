import React from 'react';
import { useState } from 'react';

import Title from './Title';
import RecordMessage from './RecordMessage';
import axios from 'axios';

const Controller = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    const createBlobUrl = (data: any) => {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        return window.URL.createObjectURL(blob);
    };

    const handleStop = async (blobUrl: string) => {
        setIsLoading(true);

        // Append recorded message to messages.
        const myMessage = { sender: 'me', blobUrl };
        const messageArr = [...messages, myMessage];

        // Convert blog URL to blob object.
        fetch(blobUrl)
            .then((res) => res.blob())
            .then(async (blob) => {
                // Construct audio to send file.
                const formData = new FormData();

                formData.append('file', blob, 'myFile.wav');

                // Send form data to API endpoint.
                await axios
                    .post('http://localhost:8000/post-audio', formData, {
                        headers: { 'Content-Type': 'audio/mpeg' },
                        responseType: 'arraybuffer',
                    })
                    .then((res: any) => {
                        const blob = res.data;
                        const audio = new Audio();
                        audio.src = createBlobUrl(blob);

                        // Append to audio.
                        const rachelMessage = {
                            sender: 'rachel',
                            blobUrl: audio.src,
                        };

                        messageArr.push(rachelMessage);

                        setMessages(messageArr);

                        setIsLoading(false);
                        // Play Audion
                        audio.play();
                    })
                    .catch((err) => {
                        console.error(err.message);
                        setIsLoading(false);
                    });
            });

        setIsLoading(false);
    };

    return (
        <div className='h-screen overflow-y-hidden'>
            <Title setMessages={setMessages} />
            <div className='flex flex-col justify-between h-full overflow-y-scroll pb-96'>
                {/* Recorder */}
                <div className='fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500'>
                    <div className='flex justify-center items-center w-full'>
                        <RecordMessage handleStop={handleStop} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Controller;
