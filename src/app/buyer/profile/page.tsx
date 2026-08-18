"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import BuyerSidebar from "@/components/buyer/BuyerSidebar";

interface BuyerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  location?: string;
  bio?: string;
  industries?: string[];
  investmentRange?: {
    min: number;
    max: number;
  };
  acquisitionTypes?: string[];
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    location: "",
    bio: "",
    industries: [] as string[],
    investmentMin: "",
    investmentMax: "",
    acquisitionTypes: [] as string[],
  });

  const [industryInput, setIndustryInput] = useState("");
  const [acquisitionInput, setAcquisitionInput] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }

      const authData = await authRes.json();
      if (authData.role !== "BUYER") {
        setError("Access denied. Buyer role required.");
        setLoading(false);
        return;
      }

      const profileRes = await fetch("/api/buyers/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const p = profileData.data;
        setProfile(p);

        setFormData({
          name: p.name || "",
          company: p.company || "",
          location: p.location || "",
          bio: p.bio || "",
          industries: p.industries || [],
          investmentMin: p.investmentRange?.min?.toString() || "",
          investmentMax: p.investmentRange?.max?.toString() || "",
          acquisitionTypes: p.acquisitionTypes || [],
        });
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const updateData: any = {
        name: formData.name,
        company: formData.company,
        location: formData.location,
        bio: formData.bio,
        industries: formData.industries,
        acquisitionTypes: formData.acquisitionTypes,
      };

      if (formData.investmentMin || formData.investmentMax) {
        updateData.investmentRange = {
          min: formData.investmentMin ? parseInt(formData.investmentMin) : 0,
          max: formData.investmentMax ? parseInt(formData.investmentMax) : 0,
        };
      }

      const response = await fetch("/api/buyers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addIndustry = () => {
    if (industryInput.trim() && !formData.industries.includes(industryInput.trim())) {
      setFormData({
        ...formData,
        industries: [...formData.industries, industryInput.trim()],
      });
      setIndustryInput("");
    }
  };

  const removeIndustry = (industry: string) => {
    setFormData({
      ...formData,
      industries: formData.industries.filter((i) => i !== industry),
    });
  };

  const addAcquisitionType = () => {
    if (acquisitionInput.trim() && !formData.acquisitionTypes.includes(acquisitionInput.trim())) {
      setFormData({
        ...formData,
        acquisitionTypes: [...formData.acquisitionTypes, acquisitionInput.trim()],
      });
      setAcquisitionInput("");
    }
  };

  const removeAcquisitionType = (type: string) => {
    setFormData({
      ...formData,
      acquisitionTypes: formData.acquisitionTypes.filter((t) => t !== type),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <BuyerSidebar />

          <div className="flex-1">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h1 className="mb-6 text-2xl font-bold text-slate-900">
                My Profile
              </h1>

              {success && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">
                  Profile updated successfully!
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Company */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., San Francisco, CA"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    placeholder="Tell sellers about your acquisition interests..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Industries */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Industries of Interest
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIndustry();
                        }
                      }}
                      placeholder="e.g., Technology"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addIndustry}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                  {formData.industries.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.industries.map((industry, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                        >
                          {industry}
                          <button
                            type="button"
                            onClick={() => removeIndustry(industry)}
                            className="hover:text-slate-900"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Investment Range */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Investment Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.investmentMin}
                      onChange={(e) =>
                        setFormData({ ...formData, investmentMin: e.target.value })
                      }
                      placeholder="Min"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={formData.investmentMax}
                      onChange={(e) =>
                        setFormData({ ...formData, investmentMax: e.target.value })
                      }
                      placeholder="Max"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Acquisition Types */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Acquisition Types
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={acquisitionInput}
                      onChange={(e) => setAcquisitionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAcquisitionType();
                        }
                      }}
                      placeholder="e.g., Strategic Acquisition"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addAcquisitionType}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                  {formData.acquisitionTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.acquisitionTypes.map((type, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                        >
                          {type}
                          <button
                            type="button"
                            onClick={() => removeAcquisitionType(type)}
                            className="hover:text-slate-900"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={loadProfile}
                    className="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
