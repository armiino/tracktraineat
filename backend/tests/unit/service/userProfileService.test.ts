// tests/unit/service/userProfileService.test.ts

import { userProfileService } from "../../../service/userProfileService";
import { UserProfileDto } from "../../../dto/UserProfileDto";
import { UserProfile } from "../../../model/UserProfile";

const mockRepo = {
  save: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
};

describe("userProfileService", () => {
  const service = userProfileService(mockRepo);
  const sampleDto: UserProfileDto = {
    weight: 70,
    height: 175,
    age: 28,
    gender: "male",
    activity: "medium",
    goal: "gainMuscle",
    dietType: "omnivore",
  };

  const userId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create neues profil und speichert", async () => {
    const result = await service.createProfile(userId, sampleDto);

    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(UserProfile));
    expect(result).toBeInstanceOf(UserProfile);
    expect(result.userId).toBe(userId);
    expect(result.goal).toBe(sampleDto.goal);
  });

  it("get profile mit user id", async () => {
    const fakeProfile = new UserProfile(
      userId,
      70,
      175,
      28,
      "male",
      "medium",
      "gainMuscle",
      "omnivore"
    );
    mockRepo.findByUserId.mockResolvedValue(fakeProfile);

    const result = await service.getProfile(userId);

    expect(mockRepo.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toBe(fakeProfile);
  });

  it("profil update", async () => {
    const result = await service.updateProfile(userId, sampleDto);

    expect(mockRepo.update).toHaveBeenCalledWith(expect.any(UserProfile));
    expect(result).toBeInstanceOf(UserProfile);
    expect(result.userId).toBe(userId);
    expect(result.activity).toBe(sampleDto.activity);
  });
});
