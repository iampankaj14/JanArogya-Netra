              </View>
            ))}
            </ScrollView>
          )}

          {/* Pagination Dots (Mocked for 1 item) */}
          <View className="flex-row justify-center mt-4 mb-2 gap-1.5">
            {[ { id: 'mock1' } ].map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentAiIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-blue-200'}`}
              />
            ))}
          </View>
        </View>
