import { setProfile, getProfile } from "@/services/AuthServices";
import { useEffect, useState } from "react";
import { UploadToCloudinary } from "@/utils/CloudinaryService";
import { toast } from "react-toastify";

const Profile = () => {
    const [profiles, setProfiles] = useState({
        name: "",
        image: "",
        about: ""
    });

    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    console.log("file",file);
    // 1. Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                if (data) {
                    setProfiles({
                        name: data.name || "",
                        image: data.image || "",
                        about: data.about || ""
                    });
                    // Set existing image as preview
                    if (data.image) setImagePreview(data.image);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchProfile();
    }, []);

    // 2. Handle File Selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setImagePreview(URL.createObjectURL(selectedFile));
        }
    };

    // 3. Handle Submit (Upload -> Update Backend)
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let finalImageUrl = profiles.image; // Default to old image
            if (file) {
                toast.info("Uploading image...");
                finalImageUrl = await UploadToCloudinary(file);
                console.log("finalImageUrl",finalImageUrl);
                if (!finalImageUrl) {
                    throw new Error("Image upload failed");
                }
            }

            // B. Prepare Data
            const dataToSend = {
                name: profiles.name,
                about: profiles.about,
                image: finalImageUrl // Use the new Cloudinary URL
            };

            // C. Send to Backend
            const submitdata = await setProfile(dataToSend);
            console.log(submitdata);
            // D. Update Local State
            setProfiles(prev => ({ ...prev, image: finalImageUrl }));
            toast.success("Profile Updated Successfully!");
            
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl container shadow-2xl p-6 items-center gap-6">
            <h1 className="text-2xl font-bold text-center">Profile Section</h1>
            <div className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-300">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">No Img</div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
            </div>
            <div className="w-full max-w-md flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="font-semibold">Name:</label>
                    <input 
                        type="text"
                        id="name"
                        placeholder="Enter the name"
                        value={profiles.name}
                        className="w-full border rounded-lg h-10 px-3"
                        // FIX: Update 'name' property specifically
                        onChange={(e) => setProfiles({ ...profiles, name: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="about" className="font-semibold">Bio:</label>
                    <input
                        type="text"
                        id="about"
                        value={profiles.about}
                        placeholder="Enter the bio"
                        className="w-full border rounded-lg h-10 px-3"
                        onChange={(e) => setProfiles({ ...profiles, about: e.target.value })}
                    />
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-4"
                >
                    {isLoading ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </div>
    );
}

export default Profile;