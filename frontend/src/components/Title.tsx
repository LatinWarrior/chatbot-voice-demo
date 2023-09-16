import { useState } from 'react';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';

type Props = {
    setMessages: any;
};

const Title = ({ setMessages }: Props) => {
    const [isResetting, setIsResetting] = useState(false);

    const apiUrl = process.env.REACT_APP_BACKEND_URL;

    // Reset the conversation.
    const resetConversation = async () => {
        setIsResetting(true);

        await axios
            // .get('http://localhost:8000/reset')
            .get(`${apiUrl}/reset`)
            .then((res) => {
                if (res.status === 200) {
                    // console.log(res.data);
                    setMessages([]);
                } else {
                    console.log(
                        `There was an error with the API request: ${res.status}`
                    );
                }
            })
            .catch((err) => {
                console.log(err.message);
            });

        setIsResetting(false);
    };

    return (
        <div className='flex justify-between items-center w-full p-4 bg-gray-900 text-white font-bold shadow'>
            <div className='italic'>Rachel</div>
            <button
                data-tooltip-id='reload-tooltip'
                data-tooltip-content='Clear conversation'
                onClick={resetConversation}
                className={
                    'transition-all duration-300 text-blue-300 hover:text-pink-500 ' +
                    (isResetting && 'animate-pulse')
                }>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
                    />
                </svg>
            </button>
            <Tooltip id='reload-tooltip' />
        </div>
    );
};

export default Title;
