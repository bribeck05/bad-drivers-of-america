import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, Video, X, MapPin, Car, Upload } from "lucide-react";
import type { InsertReport } from "@shared/schema";

const INCIDENT_TYPES = [
  { value: "reckless", label: "Reckless Driving", color: "bg-red-500" },
  { value: "speeding", label: "Speeding", color: "bg-orange-500" },
  { value: "texting", label: "Texting While Driving", color: "bg-yellow-500" },
  { value: "parking", label: "Terrible Parking", color: "bg-blue-500" },
  { value: "road-rage", label: "Road Rage", color: "bg-purple-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export default function CreateReport() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [incidentType, setIncidentType] = useState("reckless");
  const [authorName, setAuthorName] = useState("Anonymous Driver");
  const [mediaData, setMediaData] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation2] = useLocation();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: InsertReport) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({ title: "Report submitted!", description: "Your bad driver report is now live." });
      setLocation2("/");
    },
    onError: (err: Error) => {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    },
  });

  const handleFile = (file: File, type: "photo" | "video") => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please use a file under 8MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaData(e.target?.result as string);
      setMediaType(type);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !licensePlate.trim() || !location.trim()) {
      toast({ title: "Missing fields", description: "Title, license plate, and location are required.", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      licensePlate: licensePlate.trim().toUpperCase(),
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      location: location.trim(),
      state: state || undefined,
      mediaType,
      mediaData: mediaData || undefined,
      incidentType,
      authorName: authorName.trim() || "Anonymous Driver",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-4">
      <div className="mb-2">
        <h1 className="font-display font-black text-xl">Report a Bad Driver</h1>
        <p className="text-sm text-muted-foreground mt-1">Help make our roads safer. Share what you witnessed.</p>
      </div>

      {/* Media Upload */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Photo or Video Evidence</Label>
        {mediaData ? (
          <div className="relative rounded-xl overflow-hidden border border-border">
            {mediaType === "video" ? (
              <video src={mediaData} className="w-full aspect-video object-cover" controls />
            ) : (
              <img src={mediaData} alt="Evidence preview" className="w-full aspect-video object-cover" />
            )}
            <button
              type="button"
              onClick={() => setMediaData(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              data-testid="button-remove-media"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-photo"
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors"
            >
              <Camera className="w-7 h-7 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              data-testid="button-upload-video"
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors"
            >
              <Video className="w-7 h-7 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Upload Video</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "photo")}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "video")}
            />
          </div>
        )}
      </div>

      {/* Incident Type */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Incident Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {INCIDENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setIncidentType(type.value)}
              data-testid={`button-incident-${type.value}`}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                incidentType === type.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${type.color}`} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-semibold mb-1.5 block">Report Title</Label>
        <Input
          id="title"
          data-testid="input-title"
          placeholder="e.g., Cut across 3 lanes on I-40"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-semibold mb-1.5 block">What Happened?</Label>
        <Textarea
          id="description"
          data-testid="input-description"
          placeholder="Describe the incident in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>

      {/* License Plate */}
      <div>
        <Label htmlFor="plate" className="text-sm font-semibold mb-1.5 block">
          <span className="flex items-center gap-1.5">
            <Car className="w-4 h-4" />
            License Plate Number
          </span>
        </Label>
        <Input
          id="plate"
          data-testid="input-plate"
          placeholder="e.g., ABC-1234"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          className="font-mono font-bold uppercase tracking-wider"
          maxLength={15}
        />
      </div>

      {/* Make & Model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="make" className="text-sm font-semibold mb-1.5 block">Make</Label>
          <Input
            id="make"
            data-testid="input-make"
            placeholder="e.g., Ford"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            maxLength={30}
          />
        </div>
        <div>
          <Label htmlFor="model" className="text-sm font-semibold mb-1.5 block">Model</Label>
          <Input
            id="model"
            data-testid="input-model"
            placeholder="e.g., F-150"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            maxLength={30}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="text-sm font-semibold mb-1.5 block">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Location
          </span>
        </Label>
        <Input
          id="location"
          data-testid="input-location"
          placeholder="e.g., I-40 East, Raleigh"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* State */}
      <div>
        <Label htmlFor="state" className="text-sm font-semibold mb-1.5 block">State</Label>
        <select
          id="state"
          data-testid="input-state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select State</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Author Name */}
      <div>
        <Label htmlFor="author" className="text-sm font-semibold mb-1.5 block">Your Name (optional)</Label>
        <Input
          id="author"
          data-testid="input-author"
          placeholder="Anonymous Driver"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={50}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        data-testid="button-submit-report"
        disabled={createMutation.isPending}
        className="w-full h-12 text-base font-bold"
      >
        {createMutation.isPending ? (
          "Submitting..."
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <Upload className="w-4 h-4" />
            Submit Report
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground leading-relaxed">
        By submitting, you confirm this report is truthful and based on your own observation. Do not submit false or defamatory reports.
      </p>
    </form>
  );
}
