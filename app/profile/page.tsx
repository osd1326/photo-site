import ProfileQuiet from "./_variants/ProfileQuiet"
import ProfileImpact from "./_variants/ProfileImpact"

export default function ProfilePage() {
  // ✅ 切り替え：どっちかを返すだけ
  return <ProfileImpact />
  // return <ProfileQuiet />
}