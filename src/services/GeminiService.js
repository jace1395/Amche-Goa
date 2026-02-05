/**
 * Image Validation Service - OpenRouter API
 * Uses OpenRouter to access Google Gemini for image analysis
 */

const OPENROUTER_API_KEY = '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';
const MODEL = 'google/gemini-2.0-flash-001';

/**
 * Convert file to base64
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Get user warnings count
 */
const getWarnings = () => {
    const warnings = localStorage.getItem('userWarnings');
    return warnings ? parseInt(warnings, 10) : 0;
};

/**
 * Add a warning and deduct points
 * @param {number} count - Number of warnings to add (default 1)
 */
export const addWarning = (count = 1) => {
    let warnings = getWarnings() + count;
    localStorage.setItem('userWarnings', warnings.toString());

    // Check if threshold reached (default 3)
    if (warnings >= 3) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            user.points = Math.max(0, (user.points || 0) - 50);
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        // Reset warnings after deduction
        localStorage.setItem('userWarnings', '0');
        return { warnings: 0, pointsDeducted: true };
    }

    return { warnings, pointsDeducted: false };
};

/**
 * Validate image using OpenRouter API with Gemini Vision
 */
export const validateImage = async (file, description = '') => {
    try {
        // Convert image to base64
        const base64Image = await fileToBase64(file);
        const mimeType = file.type || 'image/jpeg';

        const prompt = `You are analyzing an image for a civic issue reporting app in Goa, India.

Analyze this image and determine:
1. Is this image AI-GENERATED, FAKE, or EDITED/DOCTORED? (Look for unrealistic lighting, textures, text artifacts, or typical AI generation signs).
2. Is this content VULGAR, CENSORED, PORNOGRAPHIC, EXTREMELY VIOLENT, or INAPPROPRIATE? (Yes/No)
3. Is this a VALID civic issue? (garbage, pothole, road damage, accident, fire, etc.)
4. Selfies, random photos, blurry images, scenic photos, or unrelated content are INVALID.

Additional context from user: "${description}"

Response Logic:
- If AI-GENERATED/FAKE: Set "isAiGenerated": true, "isValid": false.
- If VULGAR/INAPPROPRIATE: Set "isSevereViolation": true, "category": "Police", "isValid": true (to report it).
- If VALID CIVIC ISSUE: Set "isValid": true and categorize.

Categories:
- 'PWD' = Roads, Potholes, Footpaths, Bridges
- 'Electricity' = Wires, Streetlights, Transformers
- 'Health' = Health hazards, Dead animals, Stagnant water
- 'Police' = Accidents, Crimes, Law violations
- 'Fire' = Fire, Smoke, Gas leaks
- 'Municipal' = Garbage, Waste, Sewage, Drains

Return ONLY a JSON object:
{
  "isValid": boolean,
  "isSevereViolation": boolean,
  "isAiGenerated": boolean,
  "category": "PWD" | "Electricity" | "Health" | "Police" | "Fire" | "Municipal" | "Invalid",
  "description": "Brief description"
}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://amchegoa.app',
                'X-Title': 'AmcheGoa Civic Reporting'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        console.log('OpenRouter Response:', content);

        // Clean and parse JSON
        const cleanContent = content
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        const result = JSON.parse(cleanContent);

        // Handle AI/Fake Images
        if (result.isAiGenerated) {
            const warningResult = addWarning(1);
            return {
                ...result,
                isValid: false,
                warningCount: warningResult.warnings,
                pointsDeducted: warningResult.pointsDeducted,
                description: "⚠️ AI-generated or fake images are not allowed."
            };
        }

        // Handle Severe Violations (Vulgar/Censored content)
        if (result.isSevereViolation) {
            // Immediate 3 warnings => 50 point deduction
            const warningResult = addWarning(3);

            return {
                ...result,
                category: 'Police', // Force police reporting
                isValid: true, // Allow it to proceed to reporting logic
                warningCount: warningResult.warnings,
                pointsDeducted: true, // Force deduction flag
                description: `⚠️ STRICT ACTION: Content flagged as inappropriate/vulgar. 50 points deducted and reported to Cyber Cell.`
            };
        }

        if (!result.isValid) {
            const warningResult = addWarning(1);
            return {
                ...result,
                warningCount: warningResult.warnings,
                pointsDeducted: warningResult.pointsDeducted,
                description: warningResult.pointsDeducted
                    ? '⚠️ 3 invalid submissions! 50 points deducted.'
                    : `❌ ${result.description} - Warning ${warningResult.warnings}/3`
            };
        }

        return {
            ...result,
            warningCount: getWarnings(),
            pointsDeducted: false
        };

    } catch (error) {
        console.error('OpenRouter Validation Error:', error);

        let errorMessage = 'AI Validation failed.';
        const errMsg = error?.message || '';

        if (errMsg.includes('401') || errMsg.includes('Unauthorized')) {
            errorMessage = 'Invalid API Key';
        } else if (errMsg.includes('429') || errMsg.includes('rate')) {
            errorMessage = 'Rate limit exceeded. Please wait.';
        } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
            errorMessage = 'Network error. Check internet connection.';
        } else if (errMsg) {
            errorMessage = `Error: ${errMsg}`;
        }

        return {
            isValid: false,
            category: 'Error',
            description: errorMessage,
            warningCount: getWarnings(),
            pointsDeducted: false
        };
    }
};

/**
 * Get current warning count
 */
export const getWarningCount = () => getWarnings();

/**
 * Reset warnings
 */
export const resetWarnings = () => {
    localStorage.setItem('userWarnings', '0');
};


/*
// ===== HARDCODED FALLBACK (Commented out - use if API fails) =====

const CATEGORY_KEYWORDS = {
    Municipal: ['garbage', 'trash', 'waste', 'dump', 'litter', 'rubbish', 'sewage', 'drain'],
    PWD: ['pothole', 'road', 'crack', 'pavement', 'footpath', 'bridge'],
    Health: ['dead', 'animal', 'health', 'mosquito', 'disease', 'hazard'],
    Police: ['thief', 'theft', 'crime', 'accident', 'police', 'robbery'],
    Fire: ['fire', 'smoke', 'burn', 'flame', 'blaze'],
    Electricity: ['electric', 'wire', 'light', 'pole', 'streetlight', 'transformer']
};

export const validateImageFallback = async (file, description = '') => {
    const textToCheck = (file.name + ' ' + description).toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (textToCheck.includes(keyword)) {
                return { isValid: true, category, description: `Detected "${keyword}"` };
            }
        }
    }
    return { isValid: false, category: 'Invalid', description: 'No civic issue detected' };
};
*/
