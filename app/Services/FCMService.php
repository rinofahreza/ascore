<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FCMService
{
    protected $messaging;

    public function __construct()
    {
        // Initialize Firebase using the credentials file
        // We assume config('firebase.projects.app.credentials') is set or fallback to env
        $credentialsPath = base_path(env('FIREBASE_CREDENTIALS', 'firebase-credentials.json'));

        if (file_exists($credentialsPath)) {
            $factory = (new Factory)->withServiceAccount($credentialsPath);
            $this->messaging = $factory->createMessaging();
        }
    }

    /**
     * Send a notification to a specific device token
     *
     * @param string $token
     * @param string $title
     * @param string $body
     * @param array $data Optional data payload
     * @param string|null $image Optional image URL
     * @return mixed
     */
    public function sendToToken($token, $title, $body, $data = [], $image = null)
    {
        if (!$this->messaging) {
            return null;
        }

        try {
            // Prepare Notification object
            // Note: If we include Notification object, the SDK/OS handles display automatically.
            // If we want FULL manual control in SW, we should send only DATA.
            // But for standard behavior, sending Notification object is fine and easier.

            $notification = Notification::create($title, $body, $image);

            $message = CloudMessage::withTarget('token', $token)
                ->withNotification($notification)
                ->withData($data);

            return $this->messaging->send($message);
        } catch (\Throwable $e) {
            // Log error or just return false
            \Log::error('FCM Send Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a notification to multiple tokens (Multicast)
     * 
     * @param array $tokens
     * @param string $title
     * @param string $body
     * @param array $data
     * @return mixed
     */
    public function sendToSafeTokens(array $tokens, $title, $body, $data = [])
    {
        if (!$this->messaging || empty($tokens)) {
            return;
        }

        // Ideally use sendMulticast, but straightforward loop is safer for small batches
        foreach ($tokens as $token) {
            $this->sendToToken($token, $title, $body, $data);
        }
    }
}
