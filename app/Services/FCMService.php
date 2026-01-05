<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\WebPushConfig;

class FCMService
{
    protected $messaging;

    public function __construct()
    {
        // Initialize Firebase using the credentials file
        // We assume config('firebase.projects.app.credentials') is set or fallback to env
        $envPath = env('FIREBASE_CREDENTIALS', 'firebase-credentials.json');
        $credentialsPath = base_path($envPath);

        if (file_exists($credentialsPath)) {
            $factory = (new Factory)->withServiceAccount($credentialsPath);
            $this->messaging = $factory->createMessaging();
        } else {
            \Log::error("FCM Init Error: Credentials not found at $credentialsPath");
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
            \Log::error("FCM Send Error: Messaging service not initialized.");
            return null;
        }

        try {
            // Prepare Notification object
            $notification = Notification::create($title, $body, $image);

            // Add WebPush Config for Click Action
            $webPush = WebPushConfig::fromArray([
                'fcm_options' => [
                    'link' => $data['url'] ?? env('APP_URL'),
                ],
            ]);

            // Add WebPush Config for Click Action
            $webPush = WebPushConfig::fromArray([
                'fcm_options' => [
                    'link' => $data['url'] ?? env('APP_URL'),
                ],
            ]);

            $message = CloudMessage::withTarget('token', $token)
                ->withNotification($notification)
                ->withWebPushConfig($webPush)
                ->withData($data);

            $result = $this->messaging->send($message);
            return $result;
        } catch (\Throwable $e) {
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
