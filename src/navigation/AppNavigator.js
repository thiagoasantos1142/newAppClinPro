import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen.jsx';
import ServiceDetailScreen from '../screens/ServiceDetailScreen.jsx';
import TrainingListScreen from '../screens/TrainingListScreen.jsx';
import TrailDetailScreen from '../screens/TrailDetailScreen.jsx';
import VideoLessonScreen from '../screens/VideoLessonScreen.jsx';
import QuizScreen from '../screens/QuizScreen.jsx';
import QuizResultScreen from '../screens/QuizResultScreen.jsx';
import CertificateScreen from '../screens/CertificateScreen.jsx';
import AvailableServicesImprovedScreen from '../screens/AvailableServicesImprovedScreen.jsx';
import ServiceDetailImprovedScreen from '../screens/ServiceDetailImprovedScreen.jsx';
import MyServicesScreen from '../screens/MyServicesScreen.jsx';
import ServiceHistoryScreen from '../screens/ServiceHistoryScreen.jsx';
import WeeklyScheduleScreen from '../screens/WeeklyScheduleScreen.jsx';
import DailyScheduleScreen from '../screens/DailyScheduleScreen.jsx';
import BlockTimeScreen from '../screens/BlockTimeScreen.jsx';
import WorkloadOverviewScreen from '../screens/WorkloadOverviewScreen.jsx';
import CommunityFeedScreen from '../screens/CommunityFeedScreen.jsx';
import CreatePostScreen from '../screens/CreatePostScreen.jsx';
import PostDetailScreen from '../screens/PostDetailScreen.jsx';
import ProfileImprovedScreen from '../screens/ProfileImprovedScreen.jsx';
import FinancialDashboardScreen from '../screens/FinancialDashboardScreen.jsx';
import TransactionsListScreen from '../screens/TransactionsListScreen.jsx';
import PaymentDetailScreen from '../screens/PaymentDetailScreen.jsx';
import MEIControlScreen from '../screens/MEIControlScreen.jsx';
import DigitalAccountOverviewScreen from '../screens/DigitalAccountOverviewScreen.jsx';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen.jsx';
import TransferMoneyScreen from '../screens/TransferMoneyScreen.jsx';
import AccountDetailsScreen from '../screens/AccountDetailsScreen.jsx';
import AccountActivationScreen from '../screens/AccountActivationScreen.jsx';
import ReputationOverviewScreen from '../screens/ReputationOverviewScreen.jsx';
import ReviewsListScreen from '../screens/ReviewsListScreen.jsx';
import VerificationStatusScreen from '../screens/VerificationStatusScreen.jsx';
import ProfessionalScoreScreen from '../screens/ProfessionalScoreScreen.jsx';
import OnboardingWelcomeScreen from '../screens/OnboardingWelcomeScreen.jsx';
import OnboardingQuestionsScreen from '../screens/OnboardingQuestionsScreen.jsx';
import OnboardingProfileScreen from '../screens/OnboardingProfileScreen.jsx';
import OnboardingAccountIntroScreen from '../screens/OnboardingAccountIntroScreen.jsx';
import OnboardingKYCScreen from '../screens/OnboardingKYCScreen.jsx';
import OnboardingFirstGoalScreen from '../screens/OnboardingFirstGoalScreen.jsx';
import OnboardingTutorialScreen from '../screens/OnboardingTutorialScreen.jsx';
import AppStructureScreen from '../screens/AppStructureScreen.jsx';
import NavigationGuideScreen from '../screens/NavigationGuideScreen.jsx';
import ProfileDebugScreen from '../screens/dev/ProfileDebugScreen.jsx';
import BackendConnectionTestScreen from '../screens/dev/BackendConnectionTestScreen';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen.jsx';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen.jsx';
import AppDrawerContent from '../components/navigation/AppDrawerContent.jsx';
import { colors } from '../theme/tokens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createNativeStackNavigator();

function MainTabs({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            height: 58 + insets.bottom,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopColor: colors.border,
            backgroundColor: '#FFFFFF',
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size, focused }) => {
            let icon = <Feather name="user" size={size} color={color} />;

            if (route.name === 'HomeTab') icon = <Feather name="home" size={size} color={color} />;
            if (route.name === 'ServicesTab') icon = <Feather name="briefcase" size={size} color={color} />;
            if (route.name === 'TrainingTab') icon = <MaterialCommunityIcons name="school-outline" size={size} color={color} />;
            if (route.name === 'CommunityTab') icon = <Feather name="users" size={size} color={color} />;
            if (route.name === 'ProfileTab') icon = <Feather name="user" size={size} color={color} />;

            return <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>{icon}</View>;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="ServicesTab" component={AvailableServicesImprovedScreen} options={{ title: 'Serviços' }} />
        <Tab.Screen name="TrainingTab" component={TrainingListScreen} options={{ title: 'Treinar' }} />
        <Tab.Screen name="CommunityTab" component={CommunityFeedScreen} options={{ title: 'Comunidade' }} />
        <Tab.Screen name="ProfileTab" component={require('../screens/ProfileScreen.jsx').default} options={{ title: 'Perfil' }} />
      </Tab.Navigator>

      <Pressable onPress={() => navigation.openDrawer()} style={[styles.menuButton, { top: insets.top + 2 }]}>
        <Feather name="menu" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="AvailableServicesImproved" component={AvailableServicesImprovedScreen} />
      <Stack.Screen name="ServiceDetailImproved" component={ServiceDetailImprovedScreen} />
      <Stack.Screen name="MyServices" component={MyServicesScreen} />
      <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
      <Stack.Screen name="WeeklySchedule" component={WeeklyScheduleScreen} />
      <Stack.Screen name="DailySchedule" component={DailyScheduleScreen} />
      <Stack.Screen name="BlockTime" component={BlockTimeScreen} />
      <Stack.Screen name="WorkloadOverview" component={WorkloadOverviewScreen} />
      <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="ProfileImproved" component={ProfileImprovedScreen} />
      <Stack.Screen name="TrailDetail" component={TrailDetailScreen} />
      <Stack.Screen name="VideoLesson" component={VideoLessonScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
      <Stack.Screen name="Certificate" component={CertificateScreen} />
      <Stack.Screen name="FinancialDashboard" component={FinancialDashboardScreen} />
      <Stack.Screen name="Transactions" component={TransactionsListScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
      <Stack.Screen name="MEIControl" component={MEIControlScreen} />
      <Stack.Screen name="DigitalAccountOverview" component={DigitalAccountOverviewScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="TransferMoney" component={TransferMoneyScreen} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen name="AccountActivation" component={AccountActivationScreen} />
      <Stack.Screen name="ReputationOverview" component={ReputationOverviewScreen} />
      <Stack.Screen name="ReviewsList" component={ReviewsListScreen} />
      <Stack.Screen name="VerificationStatus" component={VerificationStatusScreen} />
      <Stack.Screen name="ProfessionalScore" component={ProfessionalScoreScreen} />
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestionsScreen} />
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingAccountIntro" component={OnboardingAccountIntroScreen} />
      <Stack.Screen name="OnboardingKYC" component={OnboardingKYCScreen} />
      <Stack.Screen name="OnboardingFirstGoal" component={OnboardingFirstGoalScreen} />
      <Stack.Screen name="OnboardingTutorial" component={OnboardingTutorialScreen} />
      <Stack.Screen name="AppStructure" component={AppStructureScreen} />
      <Stack.Screen name="NavigationGuide" component={NavigationGuideScreen} />
      <Stack.Screen name="ProfileDebug" component={ProfileDebugScreen} />
      <Stack.Screen
        name="BackendConnectionTest"
        component={BackendConnectionTestScreen}
        options={{ title: 'Backend Test' }}
      />
    </Stack.Navigator>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: '#FFFFFF',
          text: colors.foreground,
          border: colors.border,
          primary: colors.primary,
        },
      }}
    >
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Carregando...</Text>
        </View>
      ) : isAuthenticated ? (
        <Drawer.Navigator
          id="RootDrawer"
          screenOptions={{
            headerShown: false,
            drawerType: 'slide',
            overlayColor: 'rgba(0,0,0,0.5)',
            drawerStyle: { width: 300 },
          }}
          drawerContent={(props) => <AppDrawerContent {...props} />}
        >
          <Drawer.Screen name="RootStack" component={AppStack} />
        </Drawer.Navigator>
      ) : (
        <AuthFlow />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(31,128,234,0.12)',
  },
  menuButton: {
    position: 'absolute',
    left: 12,
    zIndex: 30,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
