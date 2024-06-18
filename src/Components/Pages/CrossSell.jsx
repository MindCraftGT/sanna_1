import React, { useState, useEffect, useContext } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import Navbar from '../Navbar/Navbar';
// import Footer from '../Footer/Footer';
import { FaInfoCircle, FaEdit, FaTrashAlt, FaChartLine } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import AdvertSection from '../CashCow/AdvertSection';
import { db } from '../firebase/firebase';
import { collection, query, orderBy, where, onSnapshot, deleteDoc, doc, getDoc, getDocs, collectionGroup } from 'firebase/firestore';
import { AuthContext } from '../AppContext/AppContext';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend
);

const CrossSell = () => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [adverts, setAdverts] = useState([]);
    const [currentAdvertId, setCurrentAdvertId] = useState(null);
    const [viewershipData, setViewershipData] = useState(null);
    const [interactionsData, setInteractionsData] = useState(null);
    const [messages, setMessages] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;

        const fetchAdverts = async () => {
            const q = query(
                collection(db, "adverts"),
                where("uid", "==", user.uid),
                orderBy("timestamp", "desc")
            );
            return onSnapshot(q, (snapshot) => {
                const ads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), active: true }));
                setAdverts(ads);
            });
        };

        fetchAdverts();
    }, [user]);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleDelete = async (advertId) => {
        try {
            await deleteDoc(doc(db, "adverts", advertId));
            alert("Advert deleted successfully");
        } catch (error) {
            console.error("Error deleting advert: ", error);
            alert("Error deleting advert");
        }
    };

    const handleEdit = (advertId) => {
        console.log(`Editing advert with ID: ${advertId}`);
    };

    const handleViewPerformance = async (advertId) => {
        setCurrentAdvertId(advertId);
        console.log(`Fetching performance data for advert ID: ${advertId}`);

        try {
            const docRef = doc(db, "adverts", advertId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log(`Advert data:`, data);

                if (data.viewership && data.interactions) {
                    setViewershipData({
                        labels: data.viewership.labels,
                        datasets: [{
                            label: 'Viewership',
                            data: data.viewership.data,
                            backgroundColor: 'rgba(75,192,192,0.4)',
                            borderColor: 'rgba(75,192,192,1)',
                            borderWidth: 1,
                        }]
                    });

                    setInteractionsData({
                        labels: data.interactions.labels,
                        datasets: [{
                            label: 'Interactions',
                            data: data.interactions.data,
                            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
                            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                            borderWidth: 1,
                        }]
                    });
                } else {
                    console.error("Data missing expected fields: viewership or interactions.");
                }
            } else {
                console.error("No such document!");
            }

            const messagesRef = collection(db, "adverts", advertId, "messages");
            const messagesSnapshot = await getDocs(messagesRef);
            const messagesList = messagesSnapshot.docs.map(doc => doc.data());
            setMessages(messagesList);

        } catch (error) {
            console.error("Error fetching analytics data: ", error);
        }
    };

    const renderContent = () => {
        if (currentAdvertId) {
            return (
                <div>
                    {viewershipData && (
                        <div className="mt-2 p-2 bg-gray-100 rounded-md">
                            <Line data={viewershipData} />
                        </div>
                    )}
                    {interactionsData && (
                        <div className="mt-2 p-2 bg-gray-100 rounded-md">
                            <Bar data={interactionsData} />
                        </div>
                    )}
                    {messages.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-100 rounded-md">
                            <h3 className="text-lg font-semibold mb-2">Messages</h3>
                            <ul>
                                {messages.map((message, index) => (
                                    <li key={index} className="mb-1">{message.text}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        } else {
            return <p>Select an advert to view its performance.</p>;
        }
    };

    return (
        <div className="relative">
            <div className="fixed top-0 z-10 w-full bg-white shadow-md">
                <Navbar />
            </div>

            <div className='flex flex-col lg:flex-row h-screen'>
                <div className='lg:w-[40%] ml-12 p-4'>
                    <AdvertSection />
                </div>
                <div className='lg:w-[60%] right-0 p-4 mt-16 mr-8'>
                    <div className="mt-4 lg:mt-0 bg-green-50 rounded-lg shadow-lg p-8">
                        <div className='flex items-center'>
                            <h2 className="text-lg font-semibold mb-2">Analytics Dashboard</h2>
                            <FaInfoCircle
                                data-tooltip-id="analytic-tooltip"
                                className="ml-2 text-gray-500 cursor-pointer my-anchor-element"
                            />
                            <Tooltip
                                id="analytic-tooltip"
                                place="right"
                                effect="solid"
                                style={{ fontSize: '11px', backgroundColor: '#4ade80', color: 'white' }}>
                                Here is how your post is performing
                            </Tooltip>
                        </div>

                        <div className="text-sm space-y-2">
                            <div className="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto">
                                {adverts.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day of Posting</th>
                                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {adverts.map((advert) => (
                                                <tr key={advert.id}>
                                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{advert.id}</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{advert.text}</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{new Date(advert.timestamp?.toDate()).toLocaleDateString()}</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">Active</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">
                                                        <button
                                                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                            onClick={() => handleEdit(advert.id)}
                                                        >
                                                            <FaEdit className="mr-2" />
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => handleDelete(advert.id)}
                                                        >
                                                            <FaTrashAlt className="mr-2" />
                                                        </button>
                                                        <button
                                                            className="text-green-600 hover:text-green-900"
                                                            onClick={() => handleViewPerformance(advert.id)}
                                                        >
                                                            <FaChartLine className="mr-2" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center">No promoted posts available.</p>
                                )}
                            </div>

                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="w-full bg-white shadow-md mt-4 bottom-0">
                <Footer />
            </div> */}
        </div>
    );
};

export default CrossSell;
